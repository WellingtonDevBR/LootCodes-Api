import type { WebhookProcessResult } from '../services/payments/payment.types.js';

export interface IWebhookService {
  handleStripeWebhook(payload: string, signature: string): Promise<WebhookProcessResult>;
  handlePayPalWebhook(payload: string, headers: Record<string, string>): Promise<WebhookProcessResult>;
}
