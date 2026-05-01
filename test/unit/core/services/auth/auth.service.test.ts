import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { AuthService } from '../../../../../src/core/services/auth/auth.service.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { AuthContext } from '../../../../../src/core/services/auth/auth.types.js';

describe('AuthService', () => {
  let service: AuthService;
  let mocks: TestMocks;

  const baseCtx: AuthContext = {
    requestId: 'test-request-id',
    ipAddress: '1.2.3.4',
    userAgent: 'test-agent',
    riskLevel: 'high',
    score: 0,
  };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.SUPABASE_ANON_KEY = 'test-anon';
    process.env.INTERNAL_SERVICE_SECRET = 'test-secret';
    process.env.RECAPTCHA_PROJECT_ID = 'test-proj';
    process.env.RECAPTCHA_SITE_KEY = 'test-site';
    process.env.RECAPTCHA_API_KEY = 'test-api';
    process.env.RESEND_API_KEY = 'test-resend';
    process.env.SITE_URL = 'https://test.lootcodes.com';

    mocks = setupTestContainer();
    service = container.resolve(AuthService);
  });

  describe('sign_in', () => {
    it('should sign in with valid credentials', async () => {
      mocks.auth.addUser('test@example.com', 'password123', {
        id: 'user-1',
        email: 'test@example.com',
      });
      mocks.userRepo.setUser('test@example.com', 'user-1');

      const result = await service.handleAuth(
        {
          action: 'sign_in',
          email: 'test@example.com',
          password: 'password123',
          recaptcha_token: 'valid-token',
        },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-1');
      expect(result.session?.access_token).toBeDefined();
    });

    it('should reject sign in with wrong password', async () => {
      mocks.auth.addUser('test@example.com', 'password123', {
        id: 'user-1',
        email: 'test@example.com',
      });
      mocks.userRepo.setUser('test@example.com', 'user-1');

      await expect(
        service.handleAuth(
          {
            action: 'sign_in',
            email: 'test@example.com',
            password: 'wrong-password',
            recaptcha_token: 'valid-token',
          },
          baseCtx,
        ),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject when email is missing', async () => {
      await expect(
        service.handleAuth(
          { action: 'sign_in', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('sign_up', () => {
    it('should sign up with valid data', async () => {
      const result = await service.handleAuth(
        {
          action: 'sign_up',
          email: 'new@example.com',
          password: 'password123',
          full_name: 'Test User',
          country: 'US',
          recaptcha_token: 'valid-token',
        },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
    });

    it('should reject sign up without full_name', async () => {
      await expect(
        service.handleAuth(
          {
            action: 'sign_up',
            email: 'new@example.com',
            password: 'password123',
            country: 'US',
            recaptcha_token: 'valid-token',
          },
          baseCtx,
        ),
      ).rejects.toThrow('Full name and country are required');
    });
  });

  describe('password_reset', () => {
    it('should always return success for password reset', async () => {
      const result = await service.handleAuth(
        {
          action: 'password_reset',
          email: 'test@example.com',
          recaptcha_token: 'valid-token',
        },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('reset link');
    });
  });

  describe('phone auth', () => {
    it('should send OTP', async () => {
      const result = await service.handleAuth(
        { action: 'send-otp', phone: '+1234567890' },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent');
    });

    it('should verify OTP', async () => {
      const result = await service.handleAuth(
        { action: 'verify-otp', phone: '+1234567890', otp_code: '123456' },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.session?.access_token).toBeDefined();
    });
  });

  describe('security', () => {
    it('should block requests from blocked IPs', async () => {
      mocks.ipBlocklist.block('1.2.3.4');

      await expect(
        service.handleAuth(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Access denied');
    });

    it('should reject when rate limited', async () => {
      mocks.rateLimiter.shouldAllow = false;

      await expect(
        service.handleAuth(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Too many requests');
    });

    it('should reject when recaptcha token is missing', async () => {
      await expect(
        service.handleAuth(
          { action: 'sign_in', email: 'test@example.com', password: 'pass' },
          baseCtx,
        ),
      ).rejects.toThrow('reCAPTCHA token is missing');
    });

    it('should reject when recaptcha fails', async () => {
      mocks.recaptcha.shouldPass = false;

      await expect(
        service.handleAuth(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'bad-token' },
          baseCtx,
        ),
      ).rejects.toThrow('Security verification failed');
    });
  });
});
