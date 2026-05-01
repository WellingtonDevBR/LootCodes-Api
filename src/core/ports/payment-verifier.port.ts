import type { VerifyPaymentDto, PaymentVerificationResult } from '../use-cases/payments/payment.types.js';

export interface IPaymentVerifier {
  verifyPayment(dto: VerifyPaymentDto): Promise<PaymentVerificationResult>;
}
