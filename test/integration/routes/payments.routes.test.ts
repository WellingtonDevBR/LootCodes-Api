import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS, TOKENS } from '../../../src/di/tokens.js';

vi.mock('../../../src/http/middleware/rate-limit.guard.js', () => ({
  createRateLimitGuard: () => async () => {},
}));

describe('Payment Routes (Guest-safe)', () => {
  let app: FastifyInstance;

  const mockVerifyResult = { status: 'fulfilled', order_id: 'order-123' };
  const mockCaptureResult = { captured: true, payment_intent_id: 'pi_test', amount_cents: 2999 };

  beforeEach(async () => {
    container.register(UC_TOKENS.VerifyAndFulfill, {
      useValue: { execute: vi.fn().mockResolvedValue(mockVerifyResult) },
    });
    container.register(UC_TOKENS.CapturePayment, {
      useValue: { execute: vi.fn().mockResolvedValue(mockCaptureResult) },
    });

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
      expect(body.status).toBe('fulfilled');
      expect(body.order_id).toBe('order-123');
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
