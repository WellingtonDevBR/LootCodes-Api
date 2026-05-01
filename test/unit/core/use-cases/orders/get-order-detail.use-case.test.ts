import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetOrderDetailUseCase } from '../../../../../src/core/use-cases/orders/get-order-detail.use-case.js';

describe('GetOrderDetailUseCase', () => {
  let mocks: TestMocks;
  let uc: GetOrderDetailUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    uc = container.resolve<GetOrderDetailUseCase>(UC_TOKENS.GetOrderDetail);
  });

  it('should return order detail with items', async () => {
    mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd' });
    const detail = await uc.execute('ord-1', 'user-1');
    expect(detail.order.id).toBe('ord-1');
    expect(detail.items).toEqual([]);
  });

  it('should throw NotFoundError when order not found', async () => {
    await expect(uc.execute('nonexistent', 'user-1')).rejects.toThrow('Order not found');
  });

  it('should throw ForbiddenError when user mismatch', async () => {
    mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-2', status: 'completed', total_cents: 2999, currency: 'usd' });
    await expect(uc.execute('ord-1', 'user-1')).rejects.toThrow('You do not have access');
  });
});
