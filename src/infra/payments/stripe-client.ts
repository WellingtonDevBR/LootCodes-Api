import Stripe from 'stripe';
import { getEnv } from '../../config/env.js';
import { InternalError } from '../../core/errors/domain-errors.js';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const key = getEnv().STRIPE_SECRET_KEY;
    if (!key) {
      throw new InternalError('Stripe not configured — set STRIPE_SECRET_KEY');
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}
