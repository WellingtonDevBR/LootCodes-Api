import type { WebhookEvent, WebhookProcessResult } from '../use-cases/payments/payment.types.js';

export interface IWebhookHandler {
  processEvent(event: WebhookEvent): Promise<WebhookProcessResult>;
}
