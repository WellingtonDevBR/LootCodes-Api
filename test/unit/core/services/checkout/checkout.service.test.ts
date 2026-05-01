import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ICheckoutService } from '../../../../../src/core/ports/checkout-service.port.js';

describe('CheckoutService', () => {
  let mocks: TestMocks;
  let service: ICheckoutService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<ICheckoutService>(TOKENS.CheckoutService);
    mocks.cartValidator.stockResults = [
      { variant_id: 'var-1', available: true, available_quantity: 2999 },
    ];
  });

  describe('initializeCheckout', () => {
    it('should create checkout with payment intent', async () => {
      const result = await service.initializeCheckout(
        { items: [{ variant_id: 'var-1', quantity: 1 }] },
        'user-1',
      );
      expect(result.order_id).toBeTruthy();
      expect(result.client_secret).toBe('pi_mock_secret');
      expect(result.currency).toBe('usd');
    });

    it('should reject empty cart', async () => {
      await expect(service.initializeCheckout({ items: [] }, 'user-1')).rejects.toThrow('Cart is empty');
    });

    it('should reject out-of-stock items', async () => {
      mocks.cartValidator.stockResults = [
        { variant_id: 'var-1', available: false, available_quantity: 0 },
      ];
      await expect(
        service.initializeCheckout({ items: [{ variant_id: 'var-1', quantity: 1 }] }, 'user-1'),
      ).rejects.toThrow('out of stock');
    });

    it('should apply promo code discount', async () => {
      mocks.promoCodeValidator.validCodes.set('SAVE10', { valid: true, discount_cents: 500, discount_type: 'fixed', discount_value: 500 });
      const result = await service.initializeCheckout(
        { items: [{ variant_id: 'var-1', quantity: 1 }], promo_code: 'SAVE10' },
        'user-1',
      );
      expect(result.total_cents).toBe(2499);
    });
  });

  describe('cancelCheckout', () => {
    it('should cancel existing checkout', async () => {
      const result = await service.initializeCheckout(
        { items: [{ variant_id: 'var-1', quantity: 1 }] },
        'user-1',
      );
      await expect(service.cancelCheckout(result.order_id, 'user-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundError for missing order', async () => {
      await expect(service.cancelCheckout('nonexistent', 'user-1')).rejects.toThrow('Order not found');
    });
  });

  describe('validatePromoCode', () => {
    it('should validate promo code', async () => {
      mocks.promoCodeValidator.validCodes.set('VALID', { valid: true, discount_cents: 100 });
      const result = await service.validatePromoCode('VALID', [{ variant_id: 'var-1', quantity: 1 }]);
      expect(result.valid).toBe(true);
      expect(result.discount_cents).toBe(100);
    });

    it('should reject invalid promo code', async () => {
      const result = await service.validatePromoCode('INVALID', [{ variant_id: 'var-1', quantity: 1 }]);
      expect(result.valid).toBe(false);
    });
  });
});
