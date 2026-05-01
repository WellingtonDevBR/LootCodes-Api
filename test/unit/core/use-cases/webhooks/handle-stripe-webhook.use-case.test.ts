import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { HandleStripeWebhookUseCase } from '../../../../../src/core/use-cases/webhooks/handle-stripe-webhook.use-case.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('HandleStripeWebhookUseCase', () => {
  let mocks: TestMocks;
  let useCase: HandleStripeWebhookUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<HandleStripeWebhookUseCase>(UC_TOKENS.HandleStripeWebhook);
  });

  it('processes a valid webhook event', async () => {
    const result = await useCase.execute('{"id":"evt_1"}', 'sig_valid');

    expect(result.processed).toBe(true);
    expect(result.event_id).toBe('evt_mock');
    expect(mocks.webhookHandler.results).toHaveLength(1);
  });

  it('throws ValidationError when payload is empty', async () => {
    await expect(
      useCase.execute('', 'sig_valid'),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when signature is empty', async () => {
    await expect(
      useCase.execute('{"id":"evt_1"}', ''),
    ).rejects.toThrow(ValidationError);
  });
});
