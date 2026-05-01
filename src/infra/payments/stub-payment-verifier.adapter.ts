import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IPaymentProvider } from '../../core/ports/payment-provider.port.js';
import type { IPaymentVerifier } from '../../core/ports/payment-verifier.port.js';
import type { VerifyPaymentDto, PaymentVerificationResult } from '../../core/services/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-payment-verifier');

@injectable()
export class StubPaymentVerifierAdapter implements IPaymentVerifier {
  constructor(
    @inject(TOKENS.PaymentProvider) private paymentProvider: IPaymentProvider,
  ) {}

  async verifyPayment(dto: VerifyPaymentDto): Promise<PaymentVerificationResult> {
    logger.info('Verifying payment via payment provider', {
      paymentIntentId: dto.payment_intent_id,
    });

    const intent = await this.paymentProvider.getPaymentIntent(dto.payment_intent_id);

    if (intent.status === 'succeeded') {
      return {
        status: 'fulfilled',
        order_id: dto.order_id,
      };
    }

    return {
      status: 'pending_verification',
      message: `Payment intent status: ${intent.status}`,
    };
  }
}
