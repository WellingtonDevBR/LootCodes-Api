import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Auth Routes', () => {
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

  describe('POST /api/auth (generic)', () => {
    it('should handle sign-in via generic endpoint', async () => {
      mocks.auth.addUser('test@example.com', 'password123', {
        id: 'user-1',
        email: 'test@example.com',
      });
      mocks.userRepo.setUser('test@example.com', 'user-1');

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth',
        payload: {
          action: 'sign_in',
          email: 'test@example.com',
          password: 'password123',
          recaptcha_token: 'valid-token',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.user.id).toBe('user-1');
    });

    it('should return 400 for missing action', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth',
        payload: { email: 'test@example.com' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/sign-in', () => {
    it('should sign in successfully', async () => {
      mocks.auth.addUser('test@example.com', 'pass123', {
        id: 'user-2',
        email: 'test@example.com',
      });
      mocks.userRepo.setUser('test@example.com', 'user-2');

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: {
          email: 'test@example.com',
          password: 'pass123',
          recaptcha_token: 'valid',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.session).toBeDefined();
    });
  });

  describe('POST /api/auth/sign-up', () => {
    it('should sign up successfully', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up',
        payload: {
          email: 'new@example.com',
          password: 'password123',
          full_name: 'Test User',
          country: 'US',
          recaptcha_token: 'valid',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.requiresVerification).toBe(true);
    });
  });

  describe('POST /api/auth/password-reset', () => {
    it('should always return success', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/password-reset',
        payload: {
          email: 'test@example.com',
          recaptcha_token: 'valid',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/auth/phone/send-otp', () => {
    it('should send OTP', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/phone/send-otp',
        payload: { phone: '+1234567890' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return ok', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('ok');
    });
  });
});
