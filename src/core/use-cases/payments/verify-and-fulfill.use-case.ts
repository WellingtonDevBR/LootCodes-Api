import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IDatabase } from '../../ports/database.port.js';
import type { IPaymentVerifierFactory } from '../../ports/payment-provider-factory.port.js';
import type { IRiskAssessor } from '../../ports/risk-assessor.port.js';
import type { IFulfillmentService } from '../../ports/fulfillment-service.port.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import type { IRecaptchaVerifier } from '../../ports/recaptcha.port.js';
import { isAssessmentAcceptable } from '../../ports/recaptcha.port.js';
import type { ICardChallengeRepository } from '../../ports/card-challenge-repository.port.js';
import type { VerifyPaymentDto, PaymentVerificationResult, RiskAssessment } from './payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('verify-and-fulfill-use-case');

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  fulfillment_status: string | null;
  processing_status: string | null;
  user_id: string | null;
  guest_email: string | null;
  delivery_email: string | null;
  contact_email: string | null;
  customer_full_name: string | null;
  session_id: string | null;
  total_amount: number;
  fraud_score: number | null;
  risk_factors: unknown;
  risk_assessment_details: unknown;
}

const ORDER_SELECT = [
  'id', 'order_number', 'status', 'fulfillment_status', 'processing_status',
  'user_id', 'guest_email', 'delivery_email', 'contact_email',
  'customer_full_name', 'session_id', 'total_amount',
  'fraud_score', 'risk_factors', 'risk_assessment_details',
].join(', ');

function normalizeRiskFactors(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

/**
 * Canonical gate from webhook / Edge assess-risk persisted on orders.risk_assessment_details.
 * When absent, callers fall back to the lightweight infra risk scorer.
 */
function extractPersistedRiskGate(
  details: unknown,
): {
  recommendation: 'fulfill' | 'review' | 'block';
  requires_hold: boolean;
  risk_level?: RiskAssessment['level'];
} | null {
  if (!details || typeof details !== 'object') return null;
  const d = details as Record<string, unknown>;
  const rec = d.recommendation;
  if (rec !== 'fulfill' && rec !== 'review' && rec !== 'block') return null;
  const rl = d.risk_level;
  let risk_level: RiskAssessment['level'] | undefined;
  if (rl === 'low' || rl === 'medium' || rl === 'high' || rl === 'critical') {
    risk_level = rl;
  }
  return {
    recommendation: rec,
    requires_hold: Boolean(d.requires_hold),
    ...(risk_level !== undefined ? { risk_level } : {}),
  };
}

function inferProvider(id: string): 'stripe' | 'paypal' {
  return id.startsWith('pi_') ? 'stripe' : 'paypal';
}

@injectable()
export class VerifyAndFulfillUseCase {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.PaymentVerifierFactory) private verifierFactory: IPaymentVerifierFactory,
    @inject(TOKENS.RiskAssessor) private riskAssessor: IRiskAssessor,
    @inject(TOKENS.FulfillmentService) private fulfillment: IFulfillmentService,
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.SecurityHoldRepository) private securityHoldRepo: ISecurityHoldRepository,
    @inject(TOKENS.OrderAccessTokenRepository) private accessTokenRepo: IOrderAccessTokenRepository,
    @inject(TOKENS.RecaptchaVerifier) private recaptchaVerifier: IRecaptchaVerifier,
    @inject(TOKENS.CardChallengeRepository) private cardChallengeRepo: ICardChallengeRepository,
  ) {}

  async execute(
    dto: VerifyPaymentDto,
    clientIP: string,
    userAgent: string,
  ): Promise<PaymentVerificationResult> {
    if (!dto.payment_intent_id) {
      throw new ValidationError('Payment intent ID is required');
    }

    const hasRecaptchaToken = !!(dto.recaptcha_token && dto.recaptcha_token.trim());
    const recaptchaClaimedUnavailable =
      dto.recaptcha_unavailable === true && !hasRecaptchaToken;

    if (!recaptchaClaimedUnavailable && !hasRecaptchaToken) {
      return {
        success: false,
        status: 'failed',
        code: 'RECAPTCHA_REQUIRED',
        error: 'Security verification required',
        message: 'Please refresh the page and try again.',
        order_id: dto.order_id,
      };
    }

    const provider = inferProvider(dto.payment_intent_id);
    const paymentVerifier = this.verifierFactory.getVerifier(provider);
    const verification = await paymentVerifier.verifyPayment(dto);
    const cardLast4 = verification.card_last4 ?? null;

    if (verification.status === 'processing') {
      return {
        success: false,
        status: 'processing',
        order_id: dto.order_id,
        message: verification.message ?? 'Payment is still processing',
        funding_source: 'card',
        processing_reason: 'provider_review',
      };
    }

    if (verification.status !== 'fulfilled') {
      logger.warn('Payment not verified', {
        paymentIntentId: dto.payment_intent_id,
        status: verification.status,
      });
      return {
        success: false,
        status: 'error',
        order_id: dto.order_id,
        message: verification.message ?? 'Payment not verified',
      };
    }

    const orderId = dto.order_id ?? verification.order_id;
    if (!orderId) {
      return { success: false, status: 'error', message: 'Could not resolve order' };
    }

    const order = await this.db.queryOne<OrderRow>('orders', {
      select: ORDER_SELECT,
      eq: [['id', orderId]],
    });

    if (!order) {
      return { success: false, status: 'error', order_id: orderId, message: 'Order not found' };
    }

    if (order.fulfillment_status === 'fulfilled') {
      logger.info('Order already fulfilled', { orderId });
      return {
        success: true,
        status: 'verified',
        order_id: orderId,
        order_number: order.order_number,
        message: 'Payment verified and order processed successfully',
      };
    }

    const persistedGate = extractPersistedRiskGate(order.risk_assessment_details);
    const orderFactors = normalizeRiskFactors(order.risk_factors);

    const adapterRisk = await this.riskAssessor.assess({
      order_id: orderId,
      payment_intent_id: dto.payment_intent_id,
      client_ip: clientIP,
      user_agent: userAgent,
      fingerprint_hash: dto.fingerprint_hash,
      user_id: order.user_id ?? undefined,
    });

    const mergedFactors = [...new Set([...orderFactors, ...adapterRisk.factors])];

    const effectiveScore =
      persistedGate != null && order.fraud_score != null ? order.fraud_score : adapterRisk.score;

    const effectiveLevel: RiskAssessment['level'] =
      persistedGate?.risk_level ?? adapterRisk.level;

    const shouldBlock =
      adapterRisk.should_block || persistedGate?.recommendation === 'block';

    let shouldHold = persistedGate
      ? persistedGate.recommendation !== 'fulfill' || persistedGate.requires_hold
      : adapterRisk.should_hold;

    let workingFactors = [...mergedFactors];
    let workingScore = effectiveScore;

    const recaptchaStatus = await this.classifyVerifyRecaptcha(
      dto,
      clientIP,
      userAgent,
    );

    if (recaptchaStatus !== 'passed' && !shouldBlock) {
      const pen = await this.resolveRecaptchaPenalty(recaptchaStatus);
      workingScore = Math.min(100, workingScore + pen.points);
      if (!workingFactors.includes(pen.factorName)) {
        workingFactors = [pen.factorName, ...workingFactors];
      }
      shouldHold = true;
      logger.warn('reCAPTCHA verify penalty applied', {
        orderId,
        recaptchaStatus,
        factorName: pen.factorName,
        pointsAdded: pen.points,
        newScore: workingScore,
      });
    }

    if (!shouldBlock && shouldHold) {
      const cardMicroAuthOk = await this.cardChallengeRepo.hasSucceededOrderCardVerification(orderId);
      if (cardMicroAuthOk) {
        logger.info('Card micro-auth already succeeded — bypassing risk-based holds', { orderId });
        shouldHold = false;
      }
    }

    const unifiedRisk = {
      score: workingScore,
      level: effectiveLevel,
      factors: workingFactors,
    };

    if (shouldBlock) {
      logger.warn('Payment blocked by risk assessment', {
        paymentIntentId: dto.payment_intent_id,
        riskScore: unifiedRisk.score,
        riskLevel: effectiveLevel,
        factors: workingFactors.join(', '),
        gate: persistedGate ? 'persisted' : 'adapter',
      });
      return {
        success: false,
        status: 'blocked',
        order_id: orderId,
        order_number: order.order_number,
        card_last4: cardLast4,
      };
    }

    if (shouldHold) {
      return this.handleSecurityReview(order, unifiedRisk, orderId, dto.payment_intent_id, cardLast4);
    }

    return this.handleFulfillment(order, unifiedRisk, orderId, cardLast4);
  }

  private async handleSecurityReview(
    order: OrderRow,
    risk: { score: number; level: RiskAssessment['level']; factors: string[] },
    orderId: string,
    paymentIntentId: string,
    cardLast4: string | null,
  ): Promise<PaymentVerificationResult> {
    const hasFirstTimeCard = risk.factors.includes('first_purchase_new_card');
    const customerEmail = this.resolveEmail(order);

    await this.db.update('orders', { id: orderId }, {
      fraud_score: risk.score,
      risk_factors: risk.factors,
      processing_status: hasFirstTimeCard ? 'requires_verification' : 'manual_review',
      status: 'paid',
      fulfillment_status: hasFirstTimeCard ? 'pending_verification' : 'on_hold',
    });

    let holdId: string | undefined;
    try {
      const hold = await this.securityHoldRepo.createHold({
        order_id: orderId,
        user_id: order.user_id,
        guest_email: customerEmail,
        risk_score: risk.score,
        risk_factors: risk.factors,
        hold_reason: risk.factors.join(', '),
        status: 'pending_verification',
      });
      holdId = hold.id;
    } catch (err) {
      logger.error('Failed to create security hold', err, { orderId });
    }

    const ticketType = hasFirstTimeCard ? 'id_verification' : 'security_verification';
    let ticketNumber: string | null = null;

    const detailRecord =
      order.risk_assessment_details &&
      typeof order.risk_assessment_details === 'object' &&
      order.risk_assessment_details !== null
        ? (order.risk_assessment_details as Record<string, unknown>)
        : null;

    const existingTicket = await this.ticketRepo.findVerificationTicketForOrder(
      orderId,
      ['id_verification', 'security_verification'],
    );

    if (existingTicket) {
      ticketNumber = existingTicket.ticket_number;
      logger.info('Support ticket already exists for this order', { orderId, ticketNumber });
    } else {
      try {
        const triggerNames = risk.factors.map((f) => f.replace(/_/g, ' ')).join(', ');
        const ticket = await this.ticketRepo.create({
          subject: hasFirstTimeCard
            ? `ID Verification Required - Order #${order.order_number}`
            : `Security Review - Order #${order.order_number}`,
          message: hasFirstTimeCard
            ? `First-time payment detected. Customer needs to upload ID to complete order #${order.order_number}.`
            : `Automated security review triggered. Triggers: ${triggerNames}`,
          description: hasFirstTimeCard
            ? `First-time payment detected. Customer needs to upload ID to complete order #${order.order_number}.`
            : `Automated security review triggered. Triggers: ${triggerNames}`,
          ticket_type: ticketType,
          order_id: orderId,
          guest_email: customerEmail ?? undefined,
          user_id: order.user_id ?? undefined,
          source: 'system',
          source_channel: 'web',
          metadata: {
            risk_score: risk.score,
            risk_triggers: risk.factors,
            hold_id: holdId,
            order_total: order.total_amount,
            payment_intent_id: paymentIntentId,
            ...(detailRecord
              ? {
                  positive_signals: detailRecord.positive_signals,
                  breakdown: detailRecord.breakdown,
                }
              : {}),
          },
        });
        ticketNumber = ticket.ticket_number;
        logger.info('Support ticket created for security review', { orderId, ticketNumber, ticketType });
      } catch (err) {
        logger.error('Failed to create support ticket', err, { orderId });
      }
    }

    const isGuest = !order.user_id;
    let accessToken: string | undefined;

    if (isGuest && customerEmail) {
      try {
        const tokenData = await this.accessTokenRepo.generate(orderId, customerEmail);
        accessToken = tokenData.token;
        logger.info('Guest access token generated for security-review order', { orderId });
      } catch (err) {
        logger.warn('Failed to generate guest access token', err, { orderId });
      }
    }

    const status = hasFirstTimeCard ? 'requires_verification' : 'security_review';
    const message = hasFirstTimeCard
      ? 'Payment successful - ID verification required for first purchase'
      : ticketNumber
        ? `Payment successful - Security review required. Support ticket #${ticketNumber} created.`
        : 'Payment successful - Security review required';

    logger.info('Order held for review', {
      orderId,
      riskScore: risk.score,
      riskLevel: risk.level,
      status,
      hasTicket: !!ticketNumber,
    });

    return {
      success: false,
      status,
      order_id: orderId,
      order_number: order.order_number,
      message,
      ticket_number: ticketNumber ?? undefined,
      security_hold: true,
      security_review_required: !hasFirstTimeCard,
      card_last4: cardLast4,
      access_token: accessToken,
      guest_email: isGuest ? (customerEmail ?? undefined) : undefined,
    };
  }

  private async handleFulfillment(
    order: OrderRow,
    risk: { score: number },
    orderId: string,
    cardLast4: string | null,
  ): Promise<PaymentVerificationResult> {
    const result = await this.fulfillment.fulfill(orderId, risk.score);
    logger.info('Order fulfilled', {
      orderId: result.order_id,
      keysDelivered: result.keys_delivered,
    });

    if (!result.fulfilled) {
      return {
        success: true,
        status: 'pending_fulfillment',
        order_id: orderId,
        order_number: order.order_number,
        message: 'Payment confirmed! Your order is being prepared and you will be notified by email.',
        card_last4: cardLast4,
      };
    }

    const isGuest = !order.user_id;
    let accessToken: string | undefined;
    const guestEmail = isGuest
      ? (result.guest_email ?? this.resolveEmail(order) ?? undefined)
      : undefined;

    if (isGuest && guestEmail) {
      try {
        const tokenData = await this.accessTokenRepo.generate(orderId, guestEmail);
        accessToken = tokenData.token;
      } catch (err) {
        logger.warn('Failed to generate guest access token for fulfilled order', err, { orderId });
      }
    }

    return {
      success: true,
      status: 'verified',
      order_id: orderId,
      order_number: order.order_number,
      message: 'Payment verified and order processed successfully',
      keys_assigned: result.keys_delivered ?? 0,
      total_keys: result.keys_delivered ?? 0,
      card_last4: cardLast4,
      access_token: accessToken,
      guest_email: guestEmail,
    };
  }

  private resolveEmail(order: OrderRow): string | null {
    return order.contact_email || order.delivery_email || order.guest_email || null;
  }

  private async classifyVerifyRecaptcha(
    dto: VerifyPaymentDto,
    clientIP: string,
    userAgent: string,
  ): Promise<'passed' | 'unavailable' | 'invalid' | 'low_score' | 'error'> {
    const hasToken = !!(dto.recaptcha_token?.trim());

    if (!hasToken && dto.recaptcha_unavailable === true) {
      return 'unavailable';
    }

    if (!hasToken) {
      return 'invalid';
    }

    try {
      const assessment = await this.recaptchaVerifier.assess({
        token: dto.recaptcha_token!.trim(),
        expectedAction: 'verify_payment',
        userIpAddress: clientIP,
        userAgent,
      });

      if (!assessment.valid) return 'invalid';
      if (!isAssessmentAcceptable(assessment, 0.5)) return 'low_score';
      return 'passed';
    } catch {
      return 'error';
    }
  }

  private async resolveRecaptchaPenalty(
    status: 'unavailable' | 'invalid' | 'low_score' | 'error',
  ): Promise<{ factorName: string; points: number }> {
    const factorNames: Record<typeof status, string> = {
      unavailable: 'recaptcha_unavailable',
      invalid: 'recaptcha_invalid',
      low_score: 'recaptcha_low_score',
      error: 'recaptcha_error',
    };
    const factorName = factorNames[status];
    const defaults: Record<string, number> = {
      recaptcha_unavailable: 20,
      recaptcha_invalid: 25,
      recaptcha_low_score: 20,
      recaptcha_error: 15,
    };
    let points = defaults[factorName] ?? 20;

    try {
      const row = await this.db.queryOne<{ value: unknown }>('platform_settings', {
        select: 'value',
        eq: [['key', 'risk_assessment_settings']],
      });
      const raw = row?.value;
      if (raw !== null && raw !== undefined && typeof raw === 'object') {
        const fs = (raw as Record<string, unknown>).factor_scores;
        if (fs !== null && fs !== undefined && typeof fs === 'object') {
          const v = (fs as Record<string, unknown>)[factorName];
          if (typeof v === 'number') points = v;
        }
      }
    } catch {
      /* defaults */
    }

    return { factorName, points };
  }
}
