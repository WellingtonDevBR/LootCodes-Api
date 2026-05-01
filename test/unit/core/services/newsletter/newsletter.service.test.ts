import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import { NewsletterService } from '../../../../../src/core/services/newsletter/newsletter.service.js';
import type { INewsletterRepository } from '../../../../../src/core/ports/newsletter-repository.port.js';
import type { NewsletterSubscribeDto, NewsletterResult } from '../../../../../src/core/services/newsletter/newsletter.types.js';

class MockNewsletterRepository implements INewsletterRepository {
  async subscribe(_params: NewsletterSubscribeDto): Promise<NewsletterResult> {
    return { success: true, message: 'Subscription initiated' };
  }
  async confirm(_token: string): Promise<NewsletterResult> {
    return { success: true, message: 'Subscription confirmed' };
  }
  async unsubscribe(_token: string): Promise<NewsletterResult> {
    return { success: true, message: 'Unsubscribed successfully' };
  }
}

describe('NewsletterService', () => {
  let service: NewsletterService;
  let mocks: TestMocks;
  let newsletterRepo: MockNewsletterRepository;

  const validSubscribeDto: NewsletterSubscribeDto = {
    email: 'user@example.com',
    consent: true,
    language_code: 'en',
    recaptcha_token: 'valid-token',
  };

  beforeEach(() => {
    mocks = setupTestContainer();
    newsletterRepo = new MockNewsletterRepository();
    service = new NewsletterService(newsletterRepo, mocks.recaptcha);
  });

  describe('subscribe', () => {
    it('should subscribe with valid email and passing reCAPTCHA', async () => {
      const result = await service.subscribe(validSubscribeDto, '1.2.3.4');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription initiated');
    });

    it('should reject when reCAPTCHA fails', async () => {
      mocks.recaptcha.shouldPass = false;

      await expect(
        service.subscribe(validSubscribeDto, '1.2.3.4'),
      ).rejects.toThrow('Security verification failed');
    });

    it('should reject when reCAPTCHA score is too low', async () => {
      mocks.recaptcha.mockScore = 0.2;

      await expect(
        service.subscribe(validSubscribeDto, '1.2.3.4'),
      ).rejects.toThrow('Security verification failed');
    });

    it('should reject with invalid email', async () => {
      await expect(
        service.subscribe({ ...validSubscribeDto, email: 'not-an-email' }, '1.2.3.4'),
      ).rejects.toThrow('Invalid email address');
    });
  });

  describe('confirm', () => {
    it('should confirm with a valid token', async () => {
      const result = await service.confirm('valid-confirmation-token');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription confirmed');
    });

    it('should reject with empty token', async () => {
      await expect(
        service.confirm(''),
      ).rejects.toThrow('Confirmation token is required');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe with a valid token', async () => {
      const result = await service.unsubscribe('valid-unsubscribe-token');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Unsubscribed successfully');
    });

    it('should reject with empty token', async () => {
      await expect(
        service.unsubscribe(''),
      ).rejects.toThrow('Unsubscribe token is required');
    });
  });
});
