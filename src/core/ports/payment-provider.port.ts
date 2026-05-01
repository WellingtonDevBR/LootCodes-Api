export interface CreatePaymentIntentParams {
  amount_cents: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount_cents: number;
  currency: string;
}

export interface IPaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentIntent>;
  cancelPayment(intentId: string): Promise<void>;
  getPaymentIntent(intentId: string): Promise<PaymentIntent>;
}
