import type { CapturePaymentDto, CaptureResult } from '../services/payments/payment.types.js';

export interface IPaymentCaptureService {
  capturePayment(dto: CapturePaymentDto): Promise<CaptureResult>;
}
