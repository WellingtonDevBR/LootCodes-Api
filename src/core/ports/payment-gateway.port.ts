export interface PaymentStatus {
  paid: boolean;
  status: string;
  amount_cents?: number;
  currency?: string;
}

export interface IPaymentGateway {
  verifyPayment(paymentIntentId: string): Promise<PaymentStatus>;
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;
}
