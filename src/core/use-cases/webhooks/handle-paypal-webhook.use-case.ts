import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWebhookVerifier } from '../../ports/webhook-verifier.port.js';
import type { IWebhookHandler } from '../../ports/webhook-handler.port.js';
import type { WebhookEvent, WebhookProcessResult } from '../payments/payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('handle-paypal-webhook-use-case');

@injectable()
export class HandlePayPalWebhookUseCase {
  constructor(
    @inject(TOKENS.WebhookVerifier) private verifier: IWebhookVerifier,
    @inject(TOKENS.WebhookHandler) private handler: IWebhookHandler,
  ) {}

  async execute(
    payload: string,
    headers: Record<string, string>,
  ): Promise<WebhookProcessResult> {
    if (!payload) {
      throw new ValidationError('Payload is required');
    }

    const parsed = await this.verifier.verifyPayPalSignature(payload, headers);

    const event: WebhookEvent = {
      id: (parsed.id as string) ?? '',
      type: (parsed.event_type as string) ?? '',
      provider: 'paypal',
      payload: parsed,
      created_at: new Date().toISOString(),
    };

    logger.info('PayPal webhook received', { eventId: event.id, eventType: event.type });

    return this.handler.processEvent(event);
  }
}
