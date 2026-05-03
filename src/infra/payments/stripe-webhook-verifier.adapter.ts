import Stripe from 'stripe';
import { injectable } from 'tsyringe';
import type { IWebhookVerifier } from '../../core/ports/webhook-verifier.port.js';
import { ForbiddenError, InternalError } from '../../core/errors/domain-errors.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';
import { getStripeClient } from './stripe-client.js';

const logger = createLogger('stripe-webhook-verifier');

@injectable()
export class StripeWebhookVerifierAdapter implements IWebhookVerifier {
  async verifyStripeSignature(payload: string, signature: string): Promise<Record<string, unknown>> {
    const webhookSecret = getEnv().STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalError('Stripe webhook secret not configured — set STRIPE_WEBHOOK_SECRET');
    }

    try {
      const stripe = getStripeClient();
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      logger.info('Stripe webhook signature verified', { eventId: event.id, type: event.type });
      return event as unknown as Record<string, unknown>;
    } catch (err: unknown) {
      if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
        logger.warn('Stripe webhook signature verification failed', err);
        throw new ForbiddenError('Invalid webhook signature');
      }
      throw err;
    }
  }

  async verifyPayPalSignature(payload: string, _headers: Record<string, string>): Promise<Record<string, unknown>> {
    logger.warn('PayPal signature verification not yet implemented — accepting payload without verification');
    return JSON.parse(payload) as Record<string, unknown>;
  }
}
