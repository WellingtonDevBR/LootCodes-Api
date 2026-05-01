import { injectable } from 'tsyringe';
import type {
  IPaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntent,
} from '../../core/ports/payment-provider.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

// TODO: Replace with real Stripe SDK integration — set STRIPE_SECRET_KEY in env
@injectable()
export class StripePaymentAdapter implements IPaymentProvider {
  async createPaymentIntent(_params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    throw new InternalError('Stripe not configured — set STRIPE_SECRET_KEY');
  }

  async confirmPayment(_intentId: string): Promise<PaymentIntent> {
    throw new InternalError('Stripe not configured — set STRIPE_SECRET_KEY');
  }

  async cancelPayment(_intentId: string): Promise<void> {
    throw new InternalError('Stripe not configured — set STRIPE_SECRET_KEY');
  }

  async getPaymentIntent(_intentId: string): Promise<PaymentIntent> {
    throw new InternalError('Stripe not configured — set STRIPE_SECRET_KEY');
  }
}
