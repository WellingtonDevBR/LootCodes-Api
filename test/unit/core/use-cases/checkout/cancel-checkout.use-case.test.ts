import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { CancelCheckoutUseCase } from '../../../../../src/core/use-cases/checkout/cancel-checkout.use-case.js';
import type { InitializeCheckoutUseCase } from '../../../../../src/core/use-cases/checkout/initialize-checkout.use-case.js';

describe('CancelCheckoutUseCase', () => {
  let mocks: TestMocks;
  let cancelUseCase: CancelCheckoutUseCase;
  let initUseCase: InitializeCheckoutUseCase;

  const line = { variant_id: 'var-1', product_id: 'prod-1', quantity: 1, price_usd: 2999 };

  beforeEach(() => {
    mocks = setupTestContainer();
    cancelUseCase = container.resolve<CancelCheckoutUseCase>(UC_TOKENS.CancelCheckout);
    initUseCase = container.resolve<InitializeCheckoutUseCase>(UC_TOKENS.InitializeCheckout);
    mocks.cartValidator.stockResults = [
      { variant_id: 'var-1', available: true, available_quantity: 2999 },
    ];
  });

  it('should cancel existing checkout', async () => {
    const result = await initUseCase.execute({ items: [line] }, 'user-1');
    await expect(cancelUseCase.execute(result.order_id, 'user-1')).resolves.not.toThrow();
  });

  it('should throw NotFoundError for missing order', async () => {
    await expect(cancelUseCase.execute('nonexistent', 'user-1')).rejects.toThrow('Order not found');
  });

  it('should throw ForbiddenError when user does not own the order', async () => {
    const result = await initUseCase.execute({ items: [line] }, 'user-1');
    await expect(cancelUseCase.execute(result.order_id, 'user-2')).rejects.toThrow('You do not have access to this order');
  });
});
