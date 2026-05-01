import { injectable } from 'tsyringe';
import type { IPaymentCapturer } from '../../core/ports/payment-capturer.port.js';
import type { CapturePaymentDto, CaptureResult } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-payment-capturer');

@injectable()
export class StubPaymentCapturerAdapter implements IPaymentCapturer {
  async capture(dto: CapturePaymentDto): Promise<CaptureResult> {
    logger.info('Stub capture — returning success', {
      paymentIntentId: dto.payment_intent_id,
    });

    return {
      captured: true,
      payment_intent_id: dto.payment_intent_id,
      amount_cents: 0,
      currency: 'usd',
    };
  }
}
