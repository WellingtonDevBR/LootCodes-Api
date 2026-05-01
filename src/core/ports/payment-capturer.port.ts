import type { CapturePaymentDto, CaptureResult } from '../services/payments/payment.types.js';

export interface IPaymentCapturer {
  capture(dto: CapturePaymentDto): Promise<CaptureResult>;
}
