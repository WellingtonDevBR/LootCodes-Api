import Stripe from 'stripe';
import { injectable } from 'tsyringe';
import type {
  IPaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntent,
} from '../../core/ports/payment-provider.port.js';
import { InternalError, PaymentError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';
import { getStripeClient } from './stripe-client.js';

const logger = createLogger('stripe-payment-provider');

function mapIntent(intent: Stripe.PaymentIntent): PaymentIntent {
  let card_last4: string | null = null;
  const lc = intent.latest_charge;
  if (typeof lc === 'object' && lc !== null && !Array.isArray(lc)) {
    const charge = lc as Stripe.Charge;
    const pmd = charge.payment_method_details?.card;
    card_last4 = pmd?.last4 ?? null;
  }

  return {
    id: intent.id,
    client_secret: intent.client_secret ?? '',
    status: intent.status,
    amount_cents: intent.amount,
    currency: intent.currency.toUpperCase(),
    card_last4,
  };
}

@injectable()
export class StripePaymentAdapter implements IPaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    const stripe = getStripeClient();

    try {
      const intent = await stripe.paymentIntents.create({
        amount: params.amount_cents,
        currency: params.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: params.metadata ?? {},
      });

      logger.info('Stripe PaymentIntent created', {
        intentId: intent.id,
        amountCents: params.amount_cents,
        currency: params.currency,
      });

      return mapIntent(intent);
    } catch (err: unknown) {
      if (err instanceof Stripe.errors.StripeError) {
        logger.error('Stripe create PaymentIntent failed', err, {});
        throw new PaymentError(err.message ?? 'Stripe payment intent creation failed');
      }
      throw err;
    }
  }

  async confirmPayment(intentId: string): Promise<PaymentIntent> {
    return this.getPaymentIntent(intentId);
  }

  async cancelPayment(intentId: string): Promise<void> {
    const stripe = getStripeClient();
    try {
      await stripe.paymentIntents.cancel(intentId);
      logger.info('Stripe PaymentIntent cancelled', { intentId });
    } catch (err: unknown) {
      if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === 'payment_intent_unexpected_state') {
        logger.warn('PaymentIntent cancel no-op', { intentId, message: err.message });
        return;
      }
      if (err instanceof Stripe.errors.StripeError) {
        logger.error('Stripe cancel PaymentIntent failed', err, { intentId });
        throw new PaymentError(err.message ?? 'Cancel payment intent failed');
      }
      throw err;
    }
  }

  async getPaymentIntent(intentId: string): Promise<PaymentIntent> {
    const stripe = getStripeClient();
    try {
      const intent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ['latest_charge'],
      });
      return mapIntent(intent);
    } catch (err: unknown) {
      if (err instanceof Stripe.errors.StripeError) {
        logger.error('Stripe retrieve PaymentIntent failed', err, { intentId });
        throw new PaymentError(err.message ?? 'Retrieve payment intent failed');
      }
      throw err;
    }
  }
}
