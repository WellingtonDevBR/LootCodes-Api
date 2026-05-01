import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetGuestOrderUseCase } from '../../../../../src/core/use-cases/guest/get-guest-order.use-case.js';
import { AuthenticationError, ForbiddenError } from '../../../../../src/core/errors/domain-errors.js';

describe('GetGuestOrderUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetGuestOrderUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<GetGuestOrderUseCase>(UC_TOKENS.GetGuestOrder);
  });

  it('returns order detail for valid guest session', async () => {
    const orderId = 'order-guest-1';
    const email = 'guest@example.com';

    mocks.guestSessionRepo.addSession('guest-tok', {
      token: 'guest-tok',
      email,
      order_id: orderId,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });

    mocks.orderRepo.addOrder({
      id: orderId,
      user_id: email,
      status: 'completed',
      total_cents: 2999,
      currency: 'usd',
      created_at: new Date().toISOString(),
    } as any);

    const result = await useCase.execute('guest-tok', orderId);

    expect(result.order.id).toBe(orderId);
  });

  it('throws AuthenticationError for invalid token', async () => {
    await expect(
      useCase.execute('invalid-tok', 'order-1'),
    ).rejects.toThrow(AuthenticationError);
  });

  it('throws ForbiddenError when order_id does not match session', async () => {
    mocks.guestSessionRepo.addSession('tok-mismatch', {
      token: 'tok-mismatch',
      email: 'guest@example.com',
      order_id: 'order-correct',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });

    await expect(
      useCase.execute('tok-mismatch', 'order-wrong'),
    ).rejects.toThrow(ForbiddenError);
  });
});
