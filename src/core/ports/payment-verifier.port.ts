import type { VerifyPaymentDto, PaymentVerificationResult } from '../services/payments/payment.types.js';

export interface IPaymentVerifier {
  verifyPayment(dto: VerifyPaymentDto): Promise<PaymentVerificationResult>;
}
