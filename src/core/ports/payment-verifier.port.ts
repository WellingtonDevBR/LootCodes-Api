import type { VerifyPaymentDto, ProviderPaymentStatus } from '../use-cases/payments/payment.types.js';

export interface IPaymentVerifier {
  verifyPayment(dto: VerifyPaymentDto): Promise<ProviderPaymentStatus>;
}
