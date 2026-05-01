import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IPriceMatchService } from '../../../../../src/core/ports/price-match-service.port.js';
import type { PriceMatchClaimSubmission } from '../../../../../src/core/services/price-match/price-match.types.js';

function validSubmission(overrides?: Partial<PriceMatchClaimSubmission>): PriceMatchClaimSubmission {
  return {
    variant_id: 'variant-1',
    competitor_url: 'https://competitor.com/product',
    competitor_price_cents: 1999,
    competitor_currency: 'USD',
    display_currency: 'USD',
    screenshot_base64: 'iVBORw0KGgo=',
    screenshot_mime: 'image/png',
    user_id: 'user-1',
    guest_email: null,
    ...overrides,
  };
}

describe('PriceMatchService', () => {
  let mocks: TestMocks;
  let service: IPriceMatchService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IPriceMatchService>(TOKENS.PriceMatchService);
  });

  describe('submitClaim', () => {
    it('should submit a valid claim', async () => {
      const result = await service.submitClaim(validSubmission(), '127.0.0.1');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.claim_id).toBeDefined();
    });

    it('should reject empty variant_id', async () => {
      await expect(
        service.submitClaim(validSubmission({ variant_id: '' }), '127.0.0.1'),
      ).rejects.toThrow('variant_id is required');
    });

    it('should reject empty competitor_url', async () => {
      await expect(
        service.submitClaim(validSubmission({ competitor_url: '' }), '127.0.0.1'),
      ).rejects.toThrow('competitor_url is required');
    });

    it('should reject competitor_price_cents <= 0', async () => {
      await expect(
        service.submitClaim(validSubmission({ competitor_price_cents: 0 }), '127.0.0.1'),
      ).rejects.toThrow('competitor_price_cents must be greater than 0');
    });

    it('should reject empty screenshot_base64', async () => {
      await expect(
        service.submitClaim(validSubmission({ screenshot_base64: '' }), '127.0.0.1'),
      ).rejects.toThrow('screenshot_base64 is required');
    });

    it('should reject negative competitor_price_cents', async () => {
      await expect(
        service.submitClaim(validSubmission({ competitor_price_cents: -100 }), '127.0.0.1'),
      ).rejects.toThrow('competitor_price_cents must be greater than 0');
    });
  });

  describe('getUserClaims', () => {
    it('should return user claims', async () => {
      const claims = await service.getUserClaims('user-1');
      expect(Array.isArray(claims)).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return config or null', async () => {
      const config = await service.getConfig();
      expect(config === null || typeof config === 'object').toBe(true);
    });
  });

  describe('getClaimPromoCode', () => {
    it('should return null when promo code not found', async () => {
      const code = await service.getClaimPromoCode('user-1', 'nonexistent-promo');
      expect(code).toBeNull();
    });

    it('should reject empty promoCodeId', async () => {
      await expect(
        service.getClaimPromoCode('user-1', ''),
      ).rejects.toThrow('promoCodeId is required');
    });
  });
});
