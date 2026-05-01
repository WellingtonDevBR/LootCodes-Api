import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetOrderUseCase } from '../../../../../src/core/use-cases/orders/get-order.use-case.js';

describe('GetOrderUseCase', () => {
  let mocks: TestMocks;
  let uc: GetOrderUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    uc = container.resolve<GetOrderUseCase>(UC_TOKENS.GetOrder);
  });

  it('should return order when found and owned', async () => {
    mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd' });
    const order = await uc.execute('ord-1', 'user-1');
    expect(order.id).toBe('ord-1');
  });

  it('should throw NotFoundError when order missing', async () => {
    await expect(uc.execute('nonexistent', 'user-1')).rejects.toThrow('Order not found');
  });

  it('should throw ForbiddenError when user mismatch', async () => {
    mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-2', status: 'completed', total_cents: 2999, currency: 'usd' });
    await expect(uc.execute('ord-1', 'user-1')).rejects.toThrow('You do not have access');
  });
});
