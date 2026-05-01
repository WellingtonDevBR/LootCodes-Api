import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentCapturer } from '../../ports/payment-capturer.port.js';
import type { IPaymentCaptureService } from '../../ports/payment-capture-service.port.js';
import type { CapturePaymentDto, CaptureResult } from './payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('payment-capture-service');

@injectable()
export class PaymentCaptureService implements IPaymentCaptureService {
  constructor(
    @inject(TOKENS.PaymentCapturer) private capturer: IPaymentCapturer,
  ) {}

  async capturePayment(dto: CapturePaymentDto): Promise<CaptureResult> {
    if (!dto.payment_intent_id) {
      throw new ValidationError('Payment intent ID is required');
    }

    const result = await this.capturer.capture(dto);
    logger.info('Payment captured', {
      paymentIntentId: result.payment_intent_id,
      captured: result.captured,
      amountCents: result.amount_cents,
    });

    return result;
  }
}
