import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { VerifyPaymentForAccessUseCase } from '../../../../src/core/use-cases/key-delivery/verify-payment-for-access.use-case.js';
import { createMockOrderRepository } from '../../../helpers/mock-order-repository.js';
import type { Order } from '../../../../src/core/use-cases/orders/order.types.js';

describe('VerifyPaymentForAccessUseCase', () => {
  const completedOrder: Order = {
    id: 'order-001',
    user_id: 'user-abc',
    status: 'completed',
    total_cents: 2999,
    currency: 'USD',
    payment_intent_id: 'pi_test123',
  };

  const fulfilledOrder: Order = {
    id: 'order-002',
    user_id: 'user-abc',
    status: 'fulfilled',
    total_cents: 4999,
    currency: 'USD',
    payment_intent_id: 'pi_test456',
  };

  const pendingOrder: Order = {
    id: 'order-003',
    user_id: 'user-abc',
    status: 'pending',
    total_cents: 1500,
    currency: 'USD',
    payment_intent_id: 'pi_test789',
  };

  let useCase: VerifyPaymentForAccessUseCase;

  beforeEach(() => {
    const mockRepo = createMockOrderRepository([completedOrder, fulfilledOrder, pendingOrder]);
    useCase = new VerifyPaymentForAccessUseCase(mockRepo);
  });

  it('returns verified=true for completed order', async () => {
    const result = await useCase.execute({ order_id: 'order-001', user_id: 'user-abc' });

    expect(result.verified).toBe(true);
    expect(result.order_id).toBe('order-001');
    expect(result.message).toBeUndefined();
  });

  it('returns verified=true for fulfilled order', async () => {
    const result = await useCase.execute({ order_id: 'order-002', user_id: 'user-abc' });

    expect(result.verified).toBe(true);
    expect(result.order_id).toBe('order-002');
  });

  it('returns verified=false for pending order', async () => {
    const result = await useCase.execute({ order_id: 'order-003', user_id: 'user-abc' });

    expect(result.verified).toBe(false);
    expect(result.order_id).toBe('order-003');
    expect(result.message).toBe('Order payment not completed');
  });

  it('throws NotFoundError for non-existent order', async () => {
    await expect(
      useCase.execute({ order_id: 'non-existent', user_id: 'user-abc' }),
    ).rejects.toThrow('Order not found');
  });

  it('works without user_id (guest access)', async () => {
    const result = await useCase.execute({ order_id: 'order-001' });

    expect(result.verified).toBe(true);
  });

  it('works with access_token and email for guest flow', async () => {
    const result = await useCase.execute({
      order_id: 'order-002',
      access_token: 'some-token',
      email: 'guest@example.com',
    });

    expect(result.verified).toBe(true);
    expect(result.order_id).toBe('order-002');
  });
});
