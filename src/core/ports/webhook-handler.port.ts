import type { WebhookEvent, WebhookProcessResult } from '../services/payments/payment.types.js';

export interface IWebhookHandler {
  processEvent(event: WebhookEvent): Promise<WebhookProcessResult>;
}
