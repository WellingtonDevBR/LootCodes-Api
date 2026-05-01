import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { RevealKeyUseCase } from '../../../../../src/core/use-cases/key-delivery/reveal-key.use-case.js';

describe('RevealKeyUseCase', () => {
  let mocks: TestMocks;
  let uc: RevealKeyUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    uc = container.resolve<RevealKeyUseCase>(UC_TOKENS.RevealKey);
  });

  it('should decrypt and return key for valid owner with confirmed payment', async () => {
    mocks.orderRepo.addOrder({
      id: 'ord-1',
      user_id: 'user-1',
      status: 'completed',
      total_cents: 2999,
      currency: 'usd',
      payment_intent_id: 'pi_test',
    });
    mocks.paymentGateway.paymentStatus = { paid: true, status: 'succeeded', amount_cents: 2999, currency: 'usd' };

    const key = await uc.execute('key-1', 'ord-1', 'user-1', '127.0.0.1', 'test-agent');
    expect(key).toBe('DECRYPTED-KEY-VALUE');
  });

  it('should throw NotFoundError when order not found', async () => {
    await expect(uc.execute('key-1', 'nonexistent', 'user-1', '127.0.0.1', 'agent'))
      .rejects.toThrow('Order not found');
  });

  it('should throw ForbiddenError when user does not own order', async () => {
    mocks.orderRepo.addOrder({
      id: 'ord-1',
      user_id: 'user-2',
      status: 'completed',
      total_cents: 2999,
      currency: 'usd',
      payment_intent_id: 'pi_test',
    });

    await expect(uc.execute('key-1', 'ord-1', 'user-1', '127.0.0.1', 'agent'))
      .rejects.toThrow('You do not have access');
  });

  it('should throw InternalError when order has no payment intent', async () => {
    mocks.orderRepo.addOrder({
      id: 'ord-1',
      user_id: 'user-1',
      status: 'completed',
      total_cents: 2999,
      currency: 'usd',
    });

    await expect(uc.execute('key-1', 'ord-1', 'user-1', '127.0.0.1', 'agent'))
      .rejects.toThrow('Order has no associated payment');
  });

  it('should throw ForbiddenError when payment not confirmed', async () => {
    mocks.orderRepo.addOrder({
      id: 'ord-1',
      user_id: 'user-1',
      status: 'completed',
      total_cents: 2999,
      currency: 'usd',
      payment_intent_id: 'pi_test',
    });
    mocks.paymentGateway.paymentStatus = { paid: false, status: 'requires_payment_method' };

    await expect(uc.execute('key-1', 'ord-1', 'user-1', '127.0.0.1', 'agent'))
      .rejects.toThrow('Payment has not been confirmed');
  });
});
