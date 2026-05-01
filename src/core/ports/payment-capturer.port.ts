import type { CapturePaymentDto, CaptureResult } from '../use-cases/payments/payment.types.js';

export interface IPaymentCapturer {
  capture(dto: CapturePaymentDto): Promise<CaptureResult>;
}
