import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { InitializeCheckoutUseCase } from '../../../../../src/core/use-cases/checkout/initialize-checkout.use-case.js';

describe('InitializeCheckoutUseCase', () => {
  let mocks: TestMocks;
  let useCase: InitializeCheckoutUseCase;

  beforeEach(() => {
    mocks = setupTestContainer();
    useCase = container.resolve<InitializeCheckoutUseCase>(UC_TOKENS.InitializeCheckout);
    mocks.cartValidator.stockResults = [
      { variant_id: 'var-1', available: true, available_quantity: 2999 },
    ];
  });

  it('should create checkout with payment intent', async () => {
    const result = await useCase.execute(
      { items: [{ variant_id: 'var-1', quantity: 1 }] },
      'user-1',
    );
    expect(result.order_id).toBeTruthy();
    expect(result.client_secret).toBe('pi_mock_secret');
    expect(result.currency).toBe('usd');
  });

  it('should reject empty cart', async () => {
    await expect(useCase.execute({ items: [] }, 'user-1')).rejects.toThrow('Cart is empty');
  });

  it('should reject out-of-stock items', async () => {
    mocks.cartValidator.stockResults = [
      { variant_id: 'var-1', available: false, available_quantity: 0 },
    ];
    await expect(
      useCase.execute({ items: [{ variant_id: 'var-1', quantity: 1 }] }, 'user-1'),
    ).rejects.toThrow('out of stock');
  });

  it('should apply promo code discount', async () => {
    mocks.promoCodeValidator.validCodes.set('SAVE10', { valid: true, discount_cents: 500, discount_type: 'fixed', discount_value: 500 });
    const result = await useCase.execute(
      { items: [{ variant_id: 'var-1', quantity: 1 }], promo_code: 'SAVE10' },
      'user-1',
    );
    expect(result.total_cents).toBe(2499);
  });

  it('should block requests from blocked IPs', async () => {
    mocks.ipBlocklist.block('10.0.0.1');
    await expect(
      useCase.execute(
        { items: [{ variant_id: 'var-1', quantity: 1 }] },
        'user-1',
        '10.0.0.1',
      ),
    ).rejects.toThrow('Access denied');
  });

  it('should reject when rate limited', async () => {
    mocks.rateLimiter.shouldAllow = false;
    await expect(
      useCase.execute(
        { items: [{ variant_id: 'var-1', quantity: 1 }] },
        'user-1',
        '1.2.3.4',
      ),
    ).rejects.toThrow('Too many checkout attempts');
  });
});
