import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { CheckoutWithApprovalUseCase } from '../../../../../src/core/use-cases/checkout/checkout-with-approval.use-case.js';

describe('CheckoutWithApprovalUseCase', () => {
  let mocks: TestMocks;
  let useCase: CheckoutWithApprovalUseCase;

  beforeEach(() => {
    mocks = setupTestContainer();
    useCase = container.resolve<CheckoutWithApprovalUseCase>(UC_TOKENS.CheckoutWithApproval);
    mocks.cartValidator.stockResults = [
      { variant_id: 'var-1', available: true, available_quantity: 2999 },
    ];
  });

  it('should process checkout after approval token validation', async () => {
    mocks.securityHoldRepo.resolveResult = { success: true };
    const result = await useCase.execute(
      {
        approval_token: 'valid-token',
        hold_id: 'hold-1',
        items: [{ variant_id: 'var-1', quantity: 1 }],
      },
      'user-1',
    );
    expect(result.order_id).toBeTruthy();
    expect(result.client_secret).toBe('pi_mock_secret');
  });

  it('should reject invalid approval token', async () => {
    mocks.securityHoldRepo.resolveResult = { success: false, error: 'Token expired' };
    await expect(
      useCase.execute(
        {
          approval_token: 'bad-token',
          hold_id: 'hold-1',
          items: [{ variant_id: 'var-1', quantity: 1 }],
        },
        'user-1',
      ),
    ).rejects.toThrow('Token expired');
  });

  it('should reject empty cart in approval checkout', async () => {
    mocks.securityHoldRepo.resolveResult = { success: true };
    await expect(
      useCase.execute(
        {
          approval_token: 'valid-token',
          hold_id: 'hold-1',
          items: [],
        },
        'user-1',
      ),
    ).rejects.toThrow('Cart is empty');
  });

  it('should delegate to InitializeCheckoutUseCase after approval', async () => {
    mocks.securityHoldRepo.resolveResult = { success: true };
    mocks.promoCodeValidator.validCodes.set('PROMO', { valid: true, discount_cents: 100, discount_type: 'fixed', discount_value: 100 });

    const result = await useCase.execute(
      {
        approval_token: 'valid-token',
        hold_id: 'hold-1',
        items: [{ variant_id: 'var-1', quantity: 1 }],
        promo_code: 'PROMO',
      },
      'user-1',
    );

    expect(result.order_id).toBeTruthy();
    expect(result.total_cents).toBe(2899);
  });
});
