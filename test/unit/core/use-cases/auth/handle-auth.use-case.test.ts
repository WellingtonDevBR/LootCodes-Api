import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { HandleAuthUseCase } from '../../../../../src/core/use-cases/auth/handle-auth.use-case.js';
import type { AuthContext } from '../../../../../src/core/use-cases/auth/auth.types.js';

describe('HandleAuthUseCase', () => {
  let useCase: HandleAuthUseCase;
  let mocks: TestMocks;

  const baseCtx: AuthContext = {
    requestId: 'test-request-id',
    ipAddress: '1.2.3.4',
    userAgent: 'test-agent',
    riskLevel: 'high',
    score: 0,
  };

  beforeEach(() => {
    mocks = setupTestContainer();
    useCase = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
  });

  describe('sign_in', () => {
    it('should sign in with valid credentials', async () => {
      mocks.auth.addUser('test@example.com', 'password123', {
        id: 'user-1',
        email: 'test@example.com',
      });
      mocks.userRepo.setUser('test@example.com', 'user-1');

      const result = await useCase.execute(
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
        useCase.execute(
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
        useCase.execute(
          { action: 'sign_in', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('sign_up', () => {
    it('should sign up with valid data', async () => {
      const result = await useCase.execute(
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
        useCase.execute(
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
      const result = await useCase.execute(
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
      const result = await useCase.execute(
        { action: 'send-otp', phone: '+1234567890' },
        baseCtx,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent');
    });

    it('should verify OTP', async () => {
      const result = await useCase.execute(
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
        useCase.execute(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Access denied');
    });

    it('should reject when rate limited', async () => {
      mocks.rateLimiter.shouldAllow = false;

      await expect(
        useCase.execute(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'token' },
          baseCtx,
        ),
      ).rejects.toThrow('Too many requests');
    });

    it('should reject when recaptcha token is missing', async () => {
      await expect(
        useCase.execute(
          { action: 'sign_in', email: 'test@example.com', password: 'pass' },
          baseCtx,
        ),
      ).rejects.toThrow('reCAPTCHA token is missing');
    });

    it('should reject when recaptcha fails', async () => {
      mocks.recaptcha.shouldPass = false;

      await expect(
        useCase.execute(
          { action: 'sign_in', email: 'test@example.com', password: 'pass', recaptcha_token: 'bad-token' },
          baseCtx,
        ),
      ).rejects.toThrow('Security verification failed');
    });
  });
});
