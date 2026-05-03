import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { VerifyAndFulfillUseCase } from '../../../../../src/core/use-cases/payments/verify-and-fulfill.use-case.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

const ORDER_ROW = {
  id: 'order-1',
  order_number: 'ORD-001',
  status: 'paid',
  fulfillment_status: null as string | null,
  processing_status: null as string | null,
  user_id: 'user-1',
  guest_email: null,
  delivery_email: null,
  contact_email: null,
  customer_full_name: null,
  session_id: null,
  total_amount: 1000,
  fraud_score: null as number | null,
  risk_factors: null as unknown,
  risk_assessment_details: null as unknown,
};

/** reCAPTCHA gate + server verify require a token or explicit unavailable (matches Edge). */
const RC = { recaptcha_token: 'test-recaptcha-token' } as const;

describe('VerifyAndFulfillUseCase', () => {
  let mocks: TestMocks;
  let useCase: VerifyAndFulfillUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<VerifyAndFulfillUseCase>(UC_TOKENS.VerifyAndFulfill);
    mocks.recaptcha.shouldPass = true;
    mocks.recaptcha.mockScore = 0.9;
    vi.spyOn(mocks.db, 'queryOne').mockResolvedValue(ORDER_ROW);
  });

  it('returns failed RECAPTCHA_REQUIRED when no token and not unavailable', async () => {
    const result = await useCase.execute(
      { payment_intent_id: 'pi_no_rc', order_id: 'order-1' },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.code).toBe('RECAPTCHA_REQUIRED');
  });

  it('returns verified when payment verified and risk is low', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };
    mocks.riskAssessor.assessment = { score: 5, level: 'low', factors: [], should_hold: false, should_block: false };
    mocks.fulfillmentService.fulfillResult = { fulfilled: true, order_id: 'order-1', keys_delivered: 2 };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_abc', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe('verified');
    expect(result.order_id).toBe('order-1');
    expect(result.order_number).toBe('ORD-001');
  });

  it('returns pending_fulfillment when fulfillment has no keys', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };
    mocks.riskAssessor.assessment = { score: 5, level: 'low', factors: [], should_hold: false, should_block: false };
    mocks.fulfillmentService.fulfillResult = { fulfilled: false, order_id: 'order-1' };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_abc', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe('pending_fulfillment');
    expect(result.order_number).toBe('ORD-001');
  });

  it('returns error when payment is not verified', async () => {
    mocks.paymentVerifier.result = { status: 'error', order_id: 'order-1' };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_pending', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('error');
  });

  it('returns processing when provider is still processing', async () => {
    mocks.paymentVerifier.result = { status: 'processing', order_id: 'order-1', message: 'Processing' };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_proc', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('processing');
  });

  it('returns security_review when risk score triggers hold', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };
    mocks.riskAssessor.assessment = { score: 70, level: 'high', factors: ['velocity'], should_hold: true, should_block: false };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_risky', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('security_review');
    expect(result.security_hold).toBe(true);
  });

  it('returns blocked when risk score triggers block', async () => {
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };
    mocks.riskAssessor.assessment = { score: 95, level: 'critical', factors: ['blocklist_match'], should_hold: false, should_block: true };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_blocked', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('blocked');
  });

  it('returns verified if order is already fulfilled', async () => {
    vi.spyOn(mocks.db, 'queryOne').mockResolvedValue({
      ...ORDER_ROW,
      fulfillment_status: 'fulfilled',
    });
    mocks.paymentVerifier.result = { status: 'fulfilled', order_id: 'order-1' };

    const result = await useCase.execute(
      { payment_intent_id: 'pi_dup', order_id: 'order-1', ...RC },
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe('verified');
    expect(result.order_number).toBe('ORD-001');
  });

  it('throws ValidationError when payment_intent_id is missing', async () => {
    await expect(
      useCase.execute(
        { payment_intent_id: '', ...RC },
        '1.2.3.4',
        'Mozilla/5.0',
      ),
    ).rejects.toThrow(ValidationError);
  });
});
