import { injectable } from 'tsyringe';
import type { IWebhookVerifier } from '../../core/ports/webhook-verifier.port.js';
import { ForbiddenError, InternalError } from '../../core/errors/domain-errors.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';
import { getPayPalClient, PayPalApiError } from './paypal-client.js';

const logger = createLogger('paypal-webhook-verifier');

const PAYPAL_CERT_URL_HOSTS = new Set<string>([
  'api.paypal.com',
  'api.sandbox.paypal.com',
  'api-m.paypal.com',
  'api-m.sandbox.paypal.com',
  'messageverificationcerts.paypal.com',
  'messageverificationcerts.sandbox.paypal.com',
]);

@injectable()
export class PayPalWebhookVerifierAdapter implements IWebhookVerifier {
  async verifyStripeSignature(_payload: string, _signature: string): Promise<Record<string, unknown>> {
    throw new InternalError('PayPalWebhookVerifierAdapter does not handle Stripe signatures');
  }

  async verifyPayPalSignature(payload: string, headers: Record<string, string>): Promise<Record<string, unknown>> {
    const webhookId = getEnv().PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      throw new InternalError('PAYPAL_WEBHOOK_ID not configured');
    }

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(payload) as Record<string, unknown>;
    } catch {
      throw new ForbiddenError('PayPal webhook payload is not valid JSON');
    }

    if (!raw?.id || !raw?.event_type) {
      throw new ForbiddenError('PayPal webhook payload is missing id/event_type');
    }

    const envelope = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: raw,
    };

    if (Object.values(envelope).some((v) => v == null)) {
      throw new ForbiddenError('PayPal webhook: missing transmission headers');
    }

    try {
      const certHost = new URL(String(envelope.cert_url)).hostname.toLowerCase();
      if (!PAYPAL_CERT_URL_HOSTS.has(certHost)) {
        throw new ForbiddenError(`PayPal webhook: untrusted cert_url host ${certHost}`);
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      throw new ForbiddenError('PayPal webhook: malformed cert_url');
    }

    const client = getPayPalClient();
    const response = await client.request('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify(envelope),
    });

    if (!response.ok) {
      const apiErr = await client.toApiError(response, 'verifyWebhook');
      logger.error('PayPal webhook verification API failed', apiErr, {});
      throw new ForbiddenError('PayPal webhook verification failed');
    }

    const result = await response.json() as { verification_status: string };
    if (result.verification_status !== 'SUCCESS') {
      logger.warn('PayPal webhook verification rejected', { status: result.verification_status });
      throw new ForbiddenError(`PayPal webhook verification_status=${result.verification_status}`);
    }

    logger.info('PayPal webhook signature verified', {
      eventId: String(raw.id),
      eventType: String(raw.event_type),
    });

    return raw;
  }
}
