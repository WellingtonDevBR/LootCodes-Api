import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { SubscribeUseCase } from '../../../../../src/core/use-cases/newsletter/subscribe.use-case.js';

describe('SubscribeUseCase', () => {
  let mocks: TestMocks;
  let useCase: SubscribeUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<SubscribeUseCase>(UC_TOKENS.Subscribe);
  });

  it('subscribes successfully with valid email and recaptcha', async () => {
    mocks.recaptcha.shouldPass = true;
    mocks.recaptcha.mockScore = 0.9;
    mocks.newsletterRepo.result = { success: true };

    const result = await useCase.execute(
      { email: 'user@example.com', recaptcha_token: 'valid-token' },
      '1.2.3.4',
    );

    expect(result.success).toBe(true);
  });
});
