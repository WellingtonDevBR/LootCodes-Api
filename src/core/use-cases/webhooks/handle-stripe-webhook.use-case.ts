import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWebhookVerifier } from '../../ports/webhook-verifier.port.js';
import type { IWebhookHandler } from '../../ports/webhook-handler.port.js';
import type { WebhookEvent, WebhookProcessResult } from '../payments/payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('handle-stripe-webhook-use-case');

@injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    @inject(TOKENS.WebhookVerifier) private verifier: IWebhookVerifier,
    @inject(TOKENS.WebhookHandler) private handler: IWebhookHandler,
  ) {}

  async execute(payload: string, signature: string): Promise<WebhookProcessResult> {
    if (!payload || !signature) {
      throw new ValidationError('Payload and signature are required');
    }

    const parsed = await this.verifier.verifyStripeSignature(payload, signature);

    const event: WebhookEvent = {
      id: (parsed.id as string) ?? '',
      type: (parsed.type as string) ?? '',
      provider: 'stripe',
      payload: parsed,
      created_at: new Date().toISOString(),
    };

    logger.info('Stripe webhook received', { eventId: event.id, eventType: event.type });

    return this.handler.processEvent(event);
  }
}
