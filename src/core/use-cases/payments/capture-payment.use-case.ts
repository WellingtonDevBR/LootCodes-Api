import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentCapturerFactory } from '../../ports/payment-provider-factory.port.js';
import type { CapturePaymentDto, CaptureResult } from './payment.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('capture-payment-use-case');

function inferProvider(id: string): 'stripe' | 'paypal' {
  return id.startsWith('pi_') ? 'stripe' : 'paypal';
}

@injectable()
export class CapturePaymentUseCase {
  constructor(
    @inject(TOKENS.PaymentCapturerFactory) private capturerFactory: IPaymentCapturerFactory,
  ) {}

  async execute(dto: CapturePaymentDto): Promise<CaptureResult> {
    if (!dto.payment_intent_id) {
      throw new ValidationError('Payment intent ID is required');
    }

    const provider = dto.provider ?? inferProvider(dto.payment_intent_id);
    const capturer = this.capturerFactory.getCapturer(provider);

    const result = await capturer.capture(dto);
    logger.info('Payment captured', {
      provider,
      paymentIntentId: result.payment_intent_id,
      captured: result.captured,
      amountCents: result.amount_cents,
    });

    return result;
  }
}
