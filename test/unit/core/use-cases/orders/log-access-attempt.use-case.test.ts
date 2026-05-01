import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { LogAccessAttemptUseCase } from '../../../../../src/core/use-cases/orders/log-access-attempt.use-case.js';

describe('LogAccessAttemptUseCase', () => {
  let mocks: TestMocks;
  let useCase: LogAccessAttemptUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<LogAccessAttemptUseCase>(UC_TOKENS.LogAccessAttempt);
  });

  it('logs a successful access attempt without throwing', async () => {
    await expect(
      useCase.execute({
        token: 'some-token',
        order_id: 'order-1',
        email: 'user@example.com',
        success: true,
      }),
    ).resolves.toBeUndefined();
  });
});
