import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IPaymentProvider } from '../../core/ports/payment-provider.port.js';
import type { IPaymentVerifier } from '../../core/ports/payment-verifier.port.js';
import type { VerifyPaymentDto, ProviderPaymentStatus } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stripe-payment-verifier');

@injectable()
export class StripePaymentVerifierAdapter implements IPaymentVerifier {
  constructor(
    @inject(TOKENS.PaymentProvider) private paymentProvider: IPaymentProvider,
  ) {}

  async verifyPayment(dto: VerifyPaymentDto): Promise<ProviderPaymentStatus> {
    try {
      logger.info('Verifying payment status', { paymentIntentId: dto.payment_intent_id });

      const intent = await this.paymentProvider.getPaymentIntent(dto.payment_intent_id);

      const last4 = intent.card_last4 ?? null;

      switch (intent.status) {
        case 'succeeded':
          return { status: 'fulfilled', order_id: dto.order_id, card_last4: last4 };

        case 'processing':
          return { status: 'processing', order_id: dto.order_id, message: 'Payment is still processing', card_last4: last4 };

        case 'requires_action':
        case 'requires_confirmation':
          return { status: 'requires_action', order_id: dto.order_id, message: 'Additional authentication required', card_last4: last4 };

        case 'requires_capture':
          return { status: 'requires_action', order_id: dto.order_id, message: 'Payment authorized, awaiting capture', card_last4: last4 };

        case 'canceled':
          return { status: 'canceled', order_id: dto.order_id, message: 'Payment was canceled', card_last4: last4 };

        default:
          logger.warn('Unexpected payment intent status', { status: intent.status, paymentIntentId: dto.payment_intent_id });
          return { status: 'error', order_id: dto.order_id, message: 'Unexpected payment status', card_last4: last4 };
      }
    } catch (err: unknown) {
      logger.error('Payment verification failed', err, { paymentIntentId: dto.payment_intent_id });
      return { status: 'error', order_id: dto.order_id, message: 'Payment verification failed' };
    }
  }
}
