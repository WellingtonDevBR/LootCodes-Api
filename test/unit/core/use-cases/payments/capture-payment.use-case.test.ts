import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { CapturePaymentUseCase } from '../../../../../src/core/use-cases/payments/capture-payment.use-case.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('CapturePaymentUseCase', () => {
  let mocks: TestMocks;
  let useCase: CapturePaymentUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<CapturePaymentUseCase>(UC_TOKENS.CapturePayment);
  });

  it('captures payment successfully', async () => {
    mocks.paymentCapturer.captureResult = {
      captured: true,
      payment_intent_id: 'pi_test',
      amount_cents: 4999,
      currency: 'usd',
    };

    const result = await useCase.execute({ payment_intent_id: 'pi_test' });

    expect(result.captured).toBe(true);
    expect(result.payment_intent_id).toBe('pi_test');
    expect(result.amount_cents).toBe(4999);
  });

  it('returns already-captured result idempotently', async () => {
    mocks.paymentCapturer.captureResult = {
      captured: true,
      payment_intent_id: 'pi_dup',
      amount_cents: 2999,
      currency: 'usd',
    };

    const first = await useCase.execute({ payment_intent_id: 'pi_dup' });
    const second = await useCase.execute({ payment_intent_id: 'pi_dup' });

    expect(first.captured).toBe(true);
    expect(second.captured).toBe(true);
    expect(first.payment_intent_id).toBe(second.payment_intent_id);
  });

  it('throws ValidationError when payment_intent_id is missing', async () => {
    await expect(
      useCase.execute({ payment_intent_id: '' }),
    ).rejects.toThrow(ValidationError);
  });
});
