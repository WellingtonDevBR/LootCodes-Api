import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IDatabase } from '../../ports/database.port.js';
import type { IPaymentVerifier } from '../../ports/payment-verifier.port.js';
import type { IRiskAssessor } from '../../ports/risk-assessor.port.js';
import type { IFulfillmentService } from '../../ports/fulfillment-service.port.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import type { VerifyPaymentDto, PaymentVerificationResult } from './payment.types.js';
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
}

const ORDER_SELECT = [
  'id', 'order_number', 'status', 'fulfillment_status', 'processing_status',
  'user_id', 'guest_email', 'delivery_email', 'contact_email',
  'customer_full_name', 'session_id', 'total_amount',
].join(', ');

@injectable()
export class VerifyAndFulfillUseCase {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.PaymentVerifier) private paymentVerifier: IPaymentVerifier,
    @inject(TOKENS.RiskAssessor) private riskAssessor: IRiskAssessor,
    @inject(TOKENS.FulfillmentService) private fulfillment: IFulfillmentService,
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.SecurityHoldRepository) private securityHoldRepo: ISecurityHoldRepository,
    @inject(TOKENS.OrderAccessTokenRepository) private accessTokenRepo: IOrderAccessTokenRepository,
  ) {}

  async execute(
    dto: VerifyPaymentDto,
    clientIP: string,
    userAgent: string,
  ): Promise<PaymentVerificationResult> {
    if (!dto.payment_intent_id) {
      throw new ValidationError('Payment intent ID is required');
    }

    const verification = await this.paymentVerifier.verifyPayment(dto);

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

    const risk = await this.riskAssessor.assess({
      order_id: orderId,
      payment_intent_id: dto.payment_intent_id,
      client_ip: clientIP,
      user_agent: userAgent,
      fingerprint_hash: dto.fingerprint_hash,
    });

    if (risk.should_block) {
      logger.warn('Payment blocked by risk assessment', {
        paymentIntentId: dto.payment_intent_id,
        riskScore: risk.score,
        riskLevel: risk.level,
        factors: risk.factors.join(', '),
      });
      return {
        success: false,
        status: 'blocked',
        order_id: orderId,
        order_number: order.order_number,
      };
    }

    if (risk.should_hold) {
      return this.handleSecurityReview(order, risk, orderId, dto.payment_intent_id);
    }

    return this.handleFulfillment(order, risk, orderId);
  }

  private async handleSecurityReview(
    order: OrderRow,
    risk: { score: number; level: string; factors: string[] },
    orderId: string,
    paymentIntentId: string,
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
      access_token: accessToken,
      guest_email: isGuest ? (customerEmail ?? undefined) : undefined,
    };
  }

  private async handleFulfillment(
    order: OrderRow,
    risk: { score: number },
    orderId: string,
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
      access_token: accessToken,
      guest_email: guestEmail,
    };
  }

  private resolveEmail(order: OrderRow): string | null {
    return order.contact_email || order.delivery_email || order.guest_email || null;
  }
}
