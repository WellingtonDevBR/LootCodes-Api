import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ExchangeGuestSessionUseCase } from '../../../../../src/core/use-cases/guest/exchange-guest-session.use-case.js';
import { AuthenticationError } from '../../../../../src/core/errors/domain-errors.js';

describe('ExchangeGuestSessionUseCase', () => {
  let mocks: TestMocks;
  let useCase: ExchangeGuestSessionUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<ExchangeGuestSessionUseCase>(UC_TOKENS.ExchangeGuestSession);
  });

  it('exchanges a valid token for session data', async () => {
    mocks.guestSessionRepo.addSession('valid-token', {
      token: 'valid-token',
      email: 'guest@example.com',
      order_id: 'order-abc',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await useCase.execute({ token: 'valid-token' });

    expect(result.email).toBe('guest@example.com');
    expect(result.order_id).toBe('order-abc');
    expect(result.expires_at).toBeDefined();
  });

  it('throws AuthenticationError for invalid token', async () => {
    await expect(
      useCase.execute({ token: 'bad-token' }),
    ).rejects.toThrow(AuthenticationError);
  });

  it('throws AuthenticationError when order_id does not match', async () => {
    mocks.guestSessionRepo.addSession('token-xyz', {
      token: 'token-xyz',
      email: 'guest@example.com',
      order_id: 'order-real',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });

    await expect(
      useCase.execute({ token: 'token-xyz', order_id: 'order-wrong' }),
    ).rejects.toThrow(AuthenticationError);
  });
});
