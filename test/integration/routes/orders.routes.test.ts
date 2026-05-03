import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS, TOKENS } from '../../../src/di/tokens.js';
import type { IAuthProvider } from '../../../src/core/ports/auth.port.js';
import { errorHandler } from '../../../src/http/middleware/error-handler.js';

vi.mock('../../../src/http/middleware/auth.guard.js', () => ({
  authGuard: async () => {},
}));

describe('Orders Routes (Key Delivery)', () => {
  let app: FastifyInstance;
  let mockRevealKeyExecute: ReturnType<typeof vi.fn>;
  let mockVerifyPaymentExecute: ReturnType<typeof vi.fn>;
  let mockGetUserByToken: ReturnType<typeof vi.fn>;
  let mockGetOrderVerificationTicketExecute: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockRevealKeyExecute = vi.fn().mockResolvedValue(undefined);
    mockVerifyPaymentExecute = vi.fn().mockResolvedValue({
      verified: true,
      order_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    mockGetUserByToken = vi.fn().mockResolvedValue(null);
    mockGetOrderVerificationTicketExecute = vi.fn().mockResolvedValue(null);

    const stubAuthProvider: Pick<IAuthProvider, 'getUserByToken'> &
      Partial<Record<keyof IAuthProvider, ReturnType<typeof vi.fn>>> = {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getUserById: vi.fn(),
      getUserByToken: mockGetUserByToken,
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
    };
    container.register(TOKENS.AuthProvider, { useValue: stubAuthProvider as IAuthProvider });

    container.register(UC_TOKENS.GetOrderVerificationTicket, {
      useValue: { execute: mockGetOrderVerificationTicketExecute },
    });

    container.register(UC_TOKENS.GetUserOrders, { useValue: { execute: vi.fn().mockResolvedValue([]) } });
    container.register(UC_TOKENS.GetOrderDetail, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.GetKeysForOrder, { useValue: { execute: vi.fn().mockResolvedValue([]) } });
    container.register(UC_TOKENS.GetKeysForOrderItem, { useValue: { execute: vi.fn().mockResolvedValue([]) } });
    container.register(UC_TOKENS.RevealKey, { useValue: { execute: mockRevealKeyExecute } });
    container.register(UC_TOKENS.CheckKeyViewed, { useValue: { execute: vi.fn().mockResolvedValue(false) } });
    container.register(UC_TOKENS.ValidateAccessToken, { useValue: { execute: vi.fn().mockResolvedValue(true) } });
    container.register(UC_TOKENS.GenerateAccessToken, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.RefreshAccessToken, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.ClaimGuestOrder, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.LogAccessAttempt, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.VerifyPaymentForAccess, { useValue: { execute: mockVerifyPaymentExecute } });

    app = Fastify({ logger: false });
    app.setErrorHandler(errorHandler);
    const { orderRoutes } = await import('../../../src/http/routes/orders.routes.js');
    await app.register(async (instance) => {
      await orderRoutes(instance);
    }, { prefix: '/orders' });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    container.clearInstances();
  });

  describe('POST /orders/keys/:keyId/log-view (guest-safe)', () => {
    it('accepts request without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/550e8400-e29b-41d4-a716-446655440000/log-view',
        payload: {
          order_id: '550e8400-e29b-41d4-a716-446655440001',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      expect(mockRevealKeyExecute).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        'guest',
        expect.any(String),
        expect.any(String),
      );
    });

    it('accepts request with access_token for guest auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/550e8400-e29b-41d4-a716-446655440000/log-view',
        payload: {
          order_id: '550e8400-e29b-41d4-a716-446655440001',
          access_token: 'guest-token-abc',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /orders/keys/verify-payment', () => {
    it('accepts request without authentication (guest-safe)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/verify-payment',
        payload: {
          order_id: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.verified).toBe(true);
      expect(body.order_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('accepts request with email and access_token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/verify-payment',
        payload: {
          order_id: '550e8400-e29b-41d4-a716-446655440000',
          access_token: 'token-xyz',
          email: 'guest@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockVerifyPaymentExecute).toHaveBeenCalledWith({
        order_id: '550e8400-e29b-41d4-a716-446655440000',
        access_token: 'token-xyz',
        email: 'guest@example.com',
        user_id: undefined,
      });
    });

    it('rejects request without order_id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/verify-payment',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects request with invalid uuid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders/keys/verify-payment',
        payload: {
          order_id: 'not-a-uuid',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /orders/:id/verification-ticket', () => {
    const oid = '550e8400-e29b-41d4-a716-446655440099';

    it('returns 401 without Authorization or guest access header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/orders/${oid}/verification-ticket`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 401 when Bearer JWT is rejected', async () => {
      mockGetUserByToken.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: 'GET',
        url: `/orders/${oid}/verification-ticket`,
        headers: {
          authorization: 'Bearer expired-jwt',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('invokes use case with session user id when Bearer is valid', async () => {
      mockGetUserByToken.mockResolvedValueOnce({ id: 'user-valid', email: 'a@b.c' });

      mockGetOrderVerificationTicketExecute.mockResolvedValueOnce({
        id: 't1',
        ticket_number: 'TK-1',
        status: 'open',
        ticket_type: 'security_verification',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/orders/${oid}/verification-ticket?type=all`,
        headers: {
          authorization: 'Bearer good-jwt',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ticket?.id).toBe('t1');
      expect(mockGetOrderVerificationTicketExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: oid,
          sessionUserId: 'user-valid',
          queryType: 'all',
        }),
      );
    });

    it('invokes use case with guest header when Bearer absent', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/orders/${oid}/verification-ticket?type=id_verification`,
        headers: {
          'x-order-access-token': 'guest-order-token',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockGetOrderVerificationTicketExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: oid,
          orderAccessToken: 'guest-order-token',
          queryType: 'id_verification',
        }),
      );
    });
  });
});
