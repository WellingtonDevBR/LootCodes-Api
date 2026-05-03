import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Guest Routes', () => {
  let app: FastifyInstance;
  let mocks: TestMocks;

  beforeEach(async () => {
    const testApp = await buildTestApp();
    app = testApp.app;
    mocks = testApp.mocks;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /guest/session', () => {
    it('should exchange a valid token for a guest session', async () => {
      mocks.guestSessionRepo.addSession('valid-raw-token', {
        token: 'valid-raw-token',
        email: 'guest@example.com',
        order_id: 'order-abc-123',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await app.inject({
        method: 'POST',
        url: '/guest/session',
        payload: { token: 'valid-raw-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.email).toBe('guest@example.com');
      expect(body.order_id).toBe('order-abc-123');
      expect(body.expires_at).toBeDefined();
    });

    it('should return 401 for an invalid token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/guest/session',
        payload: { token: 'nonexistent-token' },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 400 when token is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/guest/session',
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /guest/orders/:orderId', () => {
    it('should return 401 when no guest token is provided', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';

      const res = await app.inject({
        method: 'GET',
        url: `/guest/orders/${orderId}`,
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 401 for an invalid guest token', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';

      const res = await app.inject({
        method: 'GET',
        url: `/guest/orders/${orderId}`,
        headers: { 'x-guest-token': 'bad-token' },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return order detail with a valid guest token', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mocks.guestSessionRepo.addSession('valid-guest-token', {
        token: 'valid-guest-token',
        email: 'guest@example.com',
        order_id: orderId,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });
      mocks.orderRepo.addOrder({
        id: orderId,
        user_id: 'guest@example.com',
        email: 'guest@example.com',
        status: 'completed',
        total_cents: 2999,
        currency: 'usd',
        created_at: new Date().toISOString(),
      });

      const res = await app.inject({
        method: 'GET',
        url: `/guest/orders/${orderId}`,
        headers: { 'x-guest-token': 'valid-guest-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.order.id).toBe(orderId);
    });

    it('should accept guest token from cookie', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mocks.guestSessionRepo.addSession('cookie-token', {
        token: 'cookie-token',
        email: 'guest@example.com',
        order_id: orderId,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });
      mocks.orderRepo.addOrder({
        id: orderId,
        user_id: 'guest@example.com',
        email: 'guest@example.com',
        status: 'completed',
        total_cents: 2999,
        currency: 'usd',
        created_at: new Date().toISOString(),
      });

      const res = await app.inject({
        method: 'GET',
        url: `/guest/orders/${orderId}`,
        headers: { cookie: 'guest_session=cookie-token' },
      });

      expect(res.statusCode).toBe(200);
    });
  });
});
