import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { WebhookService } from '../../../../../src/core/services/payments/webhook.service.js';
import { setupTestContainer } from '../../../../helpers/test-app.js';
import type { IWebhookVerifier } from '../../../../../src/core/ports/webhook-verifier.port.js';
import type { IWebhookHandler } from '../../../../../src/core/ports/webhook-handler.port.js';
import type { WebhookEvent, WebhookProcessResult } from '../../../../../src/core/services/payments/payment.types.js';
import { TOKENS } from '../../../../../src/di/tokens.js';

class MockWebhookVerifier implements IWebhookVerifier {
  async verifyStripeSignature(payload: string, _signature: string): Promise<Record<string, unknown>> {
    return JSON.parse(payload) as Record<string, unknown>;
  }

  async verifyPayPalSignature(payload: string, _headers: Record<string, string>): Promise<Record<string, unknown>> {
    return JSON.parse(payload) as Record<string, unknown>;
  }
}

class MockWebhookHandler implements IWebhookHandler {
  public lastEvent: WebhookEvent | null = null;

  async processEvent(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.lastEvent = event;
    return {
      processed: true,
      event_id: event.id,
      action_taken: `processed_${event.type}`,
    };
  }
}

describe('WebhookService', () => {
  let service: WebhookService;
  let mockVerifier: MockWebhookVerifier;
  let mockHandler: MockWebhookHandler;

  beforeEach(() => {
    setupTestContainer();

    mockVerifier = new MockWebhookVerifier();
    mockHandler = new MockWebhookHandler();

    container.register(TOKENS.WebhookVerifier, { useValue: mockVerifier });
    container.register(TOKENS.WebhookHandler, { useValue: mockHandler });

    service = container.resolve(WebhookService);
  });

  it('should handle Stripe webhook and delegate to handler', async () => {
    const payload = JSON.stringify({
      id: 'evt_stripe_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    });

    const result = await service.handleStripeWebhook(payload, 'whsec_test_sig');

    expect(result.processed).toBe(true);
    expect(result.event_id).toBe('evt_stripe_1');
    expect(mockHandler.lastEvent?.provider).toBe('stripe');
    expect(mockHandler.lastEvent?.type).toBe('payment_intent.succeeded');
  });

  it('should handle PayPal webhook and delegate to handler', async () => {
    const payload = JSON.stringify({
      id: 'WH-paypal-1',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: { id: 'capture_123' },
    });

    const result = await service.handlePayPalWebhook(payload, { 'paypal-transmission-id': 'test' });

    expect(result.processed).toBe(true);
    expect(result.event_id).toBe('WH-paypal-1');
    expect(mockHandler.lastEvent?.provider).toBe('paypal');
    expect(mockHandler.lastEvent?.type).toBe('PAYMENT.CAPTURE.COMPLETED');
  });

  it('should throw ValidationError when Stripe payload is empty', async () => {
    await expect(
      service.handleStripeWebhook('', 'sig'),
    ).rejects.toThrow('Payload and signature are required');
  });

  it('should throw ValidationError when PayPal payload is empty', async () => {
    await expect(
      service.handlePayPalWebhook('', {}),
    ).rejects.toThrow('Payload is required');
  });
});
