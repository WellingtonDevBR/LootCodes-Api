import type { VerifyPaymentDto, PaymentVerificationResult } from '../services/payments/payment.types.js';

export interface IPaymentVerificationService {
  verifyAndFulfill(dto: VerifyPaymentDto, clientIP: string, userAgent: string): Promise<PaymentVerificationResult>;
}
