import { injectable } from 'tsyringe';
import type { IWebhookVerifier } from '../../core/ports/webhook-verifier.port.js';
import { StripeWebhookVerifierAdapter } from './stripe-webhook-verifier.adapter.js';
import { PayPalWebhookVerifierAdapter } from './paypal-webhook-verifier.adapter.js';
import { isPayPalConfigured } from './paypal-client.js';
import { InternalError } from '../../core/errors/domain-errors.js';

/**
 * Delegates webhook signature verification to the correct provider adapter.
 * Replaces the old `StripeWebhookVerifierAdapter` which had a no-op stub
 * for PayPal — now PayPal webhooks are fully verified via the PayPal
 * REST verify-webhook-signature endpoint.
 */
@injectable()
export class CompositeWebhookVerifierAdapter implements IWebhookVerifier {
  private readonly stripe = new StripeWebhookVerifierAdapter();
  private paypal: PayPalWebhookVerifierAdapter | null = null;

  async verifyStripeSignature(payload: string, signature: string): Promise<Record<string, unknown>> {
    return this.stripe.verifyStripeSignature(payload, signature);
  }

  async verifyPayPalSignature(payload: string, headers: Record<string, string>): Promise<Record<string, unknown>> {
    if (!isPayPalConfigured()) {
      throw new InternalError('PayPal is not configured — cannot verify webhook');
    }
    if (!this.paypal) {
      this.paypal = new PayPalWebhookVerifierAdapter();
    }
    return this.paypal.verifyPayPalSignature(payload, headers);
  }
}
