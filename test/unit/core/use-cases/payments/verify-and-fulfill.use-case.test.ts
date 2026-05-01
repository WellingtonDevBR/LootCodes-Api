import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { VerifyAndFulfillUseCase } from '../../../../../src/core/use-cases/payments/verify-and-fulfill.use-case.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('VerifyAndFulfillUseCase', () => {
  let mocks: TestMocks;
  let useCase: VerifyAndFulfillUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<VerifyAndFulfillUseCase>(UC_TOKENS.VerifyAndFulfill);
  });

  it('returns fulfilled when payment verified and risk is low', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };
    mocks.riskAssessor.assessment = { score: 5, level: 'low', factors: [], should_hold: false, should_block: false };
    mocks.fulfillmentService.fulfillResult = { fulfilled: true, order_id: 'order-1', keys_delivered: 2 };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_abc', order_id: 'order-1' },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.status).toBe('fulfilled');
    expect(result.order_id).toBe('order-1');
  });

  it('returns error when payment is not verified', async () => {
    mocks.paymentVerifier.result = { status: 'pending_verification', order_id: 'order-2' };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_pending', order_id: 'order-2' },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.status).toBe('error');
  });

  it('returns held when risk score triggers hold', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-3' };
    mocks.riskAssessor.assessment = { score: 70, level: 'high', factors: ['velocity'], should_hold: true, should_block: false };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_risky', order_id: 'order-3' },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.status).toBe('held');
    expect(result.order_id).toBe('order-3');
  });

  it('returns blocked when risk score triggers block', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-4' };
    mocks.riskAssessor.assessment = { score: 95, level: 'critical', factors: ['blocklist_match'], should_hold: false, should_block: true };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_blocked', order_id: 'order-4' },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.status).toBe('blocked');
    expect(result.order_id).toBe('order-4');
  });

  it('throws ValidationError when payment_intent_id is missing', async () => {
    await expect(
      useCase.execute(
        { payment_intent_id: '' },
        '1.2.3.4',
        'Mozilla/5.0',
      ),
    ).rejects.toThrow(ValidationError);
  });
});
