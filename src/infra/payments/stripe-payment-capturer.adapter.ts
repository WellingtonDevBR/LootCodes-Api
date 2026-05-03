import Stripe from 'stripe';
import { injectable } from 'tsyringe';
import type { IPaymentCapturer } from '../../core/ports/payment-capturer.port.js';
import type { CapturePaymentDto, CaptureResult } from '../../core/use-cases/payments/payment.types.js';
import { PaymentError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';
import { getStripeClient } from './stripe-client.js';

const logger = createLogger('stripe-payment-capturer');

@injectable()
export class StripePaymentCapturerAdapter implements IPaymentCapturer {
  async capture(dto: CapturePaymentDto): Promise<CaptureResult> {
    const stripe = getStripeClient();

    try {
      const intent = await stripe.paymentIntents.capture(dto.payment_intent_id, {}, {
        idempotencyKey: `capture_${dto.payment_intent_id}`,
      });

      logger.info('Payment captured successfully', {
        paymentIntentId: dto.payment_intent_id,
        orderId: dto.order_id,
      });

      return {
        captured: true,
        payment_intent_id: dto.payment_intent_id,
        amount_cents: intent.amount,
        currency: intent.currency,
      };
    } catch (err: unknown) {
      if (err instanceof Stripe.errors.StripeAPIError || err instanceof Stripe.errors.StripeInvalidRequestError) {
        const stripeErr = err as InstanceType<typeof Stripe.errors.StripeError>;

        // Already captured — treat as success by re-fetching the intent
        if (stripeErr.code === 'payment_intent_unexpected_state') {
          try {
            const existing = await stripe.paymentIntents.retrieve(dto.payment_intent_id);
            if (existing.status === 'succeeded') {
              logger.info('Payment already captured', { paymentIntentId: dto.payment_intent_id });
              return {
                captured: true,
                payment_intent_id: dto.payment_intent_id,
                amount_cents: existing.amount,
                currency: existing.currency,
              };
            }
          } catch (retrieveErr: unknown) {
            logger.error('Failed to retrieve intent after capture conflict', retrieveErr, {
              paymentIntentId: dto.payment_intent_id,
            });
          }
        }

        logger.error('Stripe capture failed', err, {
          paymentIntentId: dto.payment_intent_id,
          orderId: dto.order_id,
        });
        throw new PaymentError(stripeErr.message ?? 'Payment capture failed');
      }
      throw err;
    }
  }
}
