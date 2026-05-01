import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { PaymentCaptureService } from '../../../../../src/core/services/payments/payment-capture.service.js';
import { setupTestContainer } from '../../../../helpers/test-app.js';
import type { IPaymentCapturer } from '../../../../../src/core/ports/payment-capturer.port.js';
import type { CapturePaymentDto, CaptureResult } from '../../../../../src/core/services/payments/payment.types.js';
import { TOKENS } from '../../../../../src/di/tokens.js';

class MockCapturer implements IPaymentCapturer {
  public result: CaptureResult = {
    captured: true,
    payment_intent_id: 'pi_captured',
    amount_cents: 2999,
    currency: 'usd',
  };

  async capture(_dto: CapturePaymentDto): Promise<CaptureResult> {
    return this.result;
  }
}

describe('PaymentCaptureService', () => {
  let service: PaymentCaptureService;
  let mockCapturer: MockCapturer;

  beforeEach(() => {
    setupTestContainer();

    mockCapturer = new MockCapturer();
    container.register(TOKENS.PaymentCapturer, { useValue: mockCapturer });

    service = container.resolve(PaymentCaptureService);
  });

  it('should capture payment successfully', async () => {
    const dto: CapturePaymentDto = { payment_intent_id: 'pi_test_capture' };

    const result = await service.capturePayment(dto);

    expect(result.captured).toBe(true);
    expect(result.payment_intent_id).toBe('pi_captured');
    expect(result.amount_cents).toBe(2999);
  });

  it('should throw ValidationError when payment_intent_id is empty', async () => {
    const dto: CapturePaymentDto = { payment_intent_id: '' };

    await expect(service.capturePayment(dto)).rejects.toThrow(
      'Payment intent ID is required',
    );
  });

  it('should propagate capturer errors', async () => {
    mockCapturer.capture = async () => {
      throw new Error('Capture failed at provider');
    };

    const dto: CapturePaymentDto = { payment_intent_id: 'pi_fail' };

    await expect(service.capturePayment(dto)).rejects.toThrow(
      'Capture failed at provider',
    );
  });
});
