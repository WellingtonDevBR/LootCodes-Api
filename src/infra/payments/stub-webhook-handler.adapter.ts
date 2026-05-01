import { injectable } from 'tsyringe';
import type { IWebhookHandler } from '../../core/ports/webhook-handler.port.js';
import type { WebhookEvent, WebhookProcessResult } from '../../core/services/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-webhook-handler');

@injectable()
export class StubWebhookHandlerAdapter implements IWebhookHandler {
  async processEvent(event: WebhookEvent): Promise<WebhookProcessResult> {
    logger.info('Stub webhook handler — event processed', {
      eventId: event.id,
      eventType: event.type,
      provider: event.provider,
    });

    return {
      processed: true,
      event_id: event.id,
      action_taken: `stub_processed_${event.type}`,
    };
  }
}
