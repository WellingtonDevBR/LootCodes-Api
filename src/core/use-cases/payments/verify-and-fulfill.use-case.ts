import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentVerifier } from '../../ports/payment-verifier.port.js';
import type { IRiskAssessor } from '../../ports/risk-assessor.port.js';
import type { IFulfillmentService } from '../../ports/fulfillment-service.port.js';
import type { VerifyPaymentDto, PaymentVerificationResult } from './payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('verify-and-fulfill-use-case');

@injectable()
export class VerifyAndFulfillUseCase {
  constructor(
    @inject(TOKENS.PaymentVerifier) private paymentVerifier: IPaymentVerifier,
    @inject(TOKENS.RiskAssessor) private riskAssessor: IRiskAssessor,
    @inject(TOKENS.FulfillmentService) private fulfillment: IFulfillmentService,
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

    if (verification.status !== 'fulfilled') {
      logger.warn('Payment not verified', {
        paymentIntentId: dto.payment_intent_id,
        status: verification.status,
      });
      return { status: 'error', message: 'Payment not verified' };
    }

    const orderId = dto.order_id ?? verification.order_id;

    const risk = await this.riskAssessor.assess({
      order_id: orderId ?? '',
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
      return { status: 'blocked', order_id: orderId };
    }

    if (risk.should_hold) {
      await this.fulfillment.holdOrder(
        orderId ?? '',
        `Risk score ${risk.score} (${risk.level})`,
        risk.score,
      );
      logger.info('Order held for review', {
        orderId,
        riskScore: risk.score,
        riskLevel: risk.level,
      });
      return { status: 'held', order_id: orderId };
    }

    const result = await this.fulfillment.fulfill(orderId ?? '', risk.score);
    logger.info('Order fulfilled', {
      orderId: result.order_id,
      keysDelivered: result.keys_delivered,
    });

    return {
      status: 'fulfilled',
      order_id: result.order_id,
    };
  }
}
