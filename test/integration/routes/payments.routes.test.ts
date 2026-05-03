import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../src/di/tokens.js';
import type { IBuyerCardChallengeProxy } from '../../../src/core/ports/buyer-card-challenge-proxy.port.js';

vi.mock('../../../src/http/middleware/rate-limit.guard.js', () => ({
  createRateLimitGuard: () => async () => {},
}));

describe('Payment Routes (Guest-safe)', () => {
  let app: FastifyInstance;

  const mockVerifyResult = { success: true, status: 'verified', order_id: 'order-123', order_number: 'ORD-001' };
  const mockCaptureResult = { captured: true, payment_intent_id: 'pi_test', amount_cents: 2999 };

  beforeEach(async () => {
    container.register(UC_TOKENS.VerifyAndFulfill, {
      useValue: { execute: vi.fn().mockResolvedValue(mockVerifyResult) },
    });
    container.register(UC_TOKENS.CapturePayment, {
      useValue: { execute: vi.fn().mockResolvedValue(mockCaptureResult) },
    });

    const mockProxy: IBuyerCardChallengeProxy = {
      forward: vi.fn().mockResolvedValue({
        status: 200,
        payload: { success: true, status: 'requires_card_challenge' },
      }),
    };
    container.register(TOKENS.BuyerCardChallengeProxy, { useValue: mockProxy });

    app = Fastify({ logger: false });

    const { paymentRoutes } = await import('../../../src/http/routes/payments.routes.js');
    await app.register(async (instance) => {
      await paymentRoutes(instance);
    }, { prefix: '/payments' });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    container.clearInstances();
  });

  describe('POST /payments/verify', () => {
    it('accepts request without auth (guest-safe)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments/verify',
        payload: {
          payment_intent_id: 'pi_test_123',
          order_id: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('verified');
      expect(body.order_id).toBe('order-123');
      expect(body.success).toBe(true);
    });

    it('rejects invalid payment_intent_id (schema validation)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments/verify',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /payments/card-challenge', () => {
    it('proxies whitelist body and returns upstream status + JSON', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440001';
      const response = await app.inject({
        method: 'POST',
        url: '/payments/card-challenge',
        payload: {
          action: 'start-challenge',
          order_id: orderId,
          payment_intent_id: 'pi_challenge_abc',
        },
      });

      expect(response.statusCode).toBe(200);
      const proxy = container.resolve<IBuyerCardChallengeProxy>(TOKENS.BuyerCardChallengeProxy);
      expect(proxy.forward).toHaveBeenCalledTimes(1);
      const proxyReq = (proxy.forward as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(proxyReq.body.action).toBe('start-challenge');
      expect(proxyReq.body.order_id).toBe(orderId);
      expect(proxyReq.body.payment_intent_id).toBe('pi_challenge_abc');
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.status).toBe('requires_card_challenge');
    });

    it('rejects unexpected fields (whitelist)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments/card-challenge',
        payload: {
          action: 'verify',
          order_id: '550e8400-e29b-41d4-a716-446655440002',
          amount_minor: 99,
          extra: true,
        },
      });

      expect(response.statusCode).toBe(400);
      const proxy = container.resolve<IBuyerCardChallengeProxy>(TOKENS.BuyerCardChallengeProxy);
      expect(proxy.forward).not.toHaveBeenCalled();
    });
  });

  describe('POST /payments/capture', () => {
    it('accepts request without auth (guest-safe)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments/capture',
        payload: {
          payment_intent_id: 'pi_test_capture',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.captured).toBe(true);
    });
  });
});
