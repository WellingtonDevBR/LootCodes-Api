import { injectable } from 'tsyringe';
import type { IWebhookVerifier } from '../../core/ports/webhook-verifier.port.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-webhook-verifier');

@injectable()
export class StubWebhookVerifierAdapter implements IWebhookVerifier {
  async verifyStripeSignature(payload: string, _signature: string): Promise<Record<string, unknown>> {
    logger.info('Stub Stripe signature verification — parsing payload');
    return JSON.parse(payload) as Record<string, unknown>;
  }

  async verifyPayPalSignature(payload: string, _headers: Record<string, string>): Promise<Record<string, unknown>> {
    logger.info('Stub PayPal signature verification — parsing payload');
    return JSON.parse(payload) as Record<string, unknown>;
  }
}
