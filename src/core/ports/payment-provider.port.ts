export interface CreatePaymentIntentParams {
  amount_cents: number;
  currency: string;
  customer_id?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount_cents: number;
  currency: string;
  /** Present when Stripe expanded `latest_charge` and card details exist. */
  card_last4?: string | null;
  /** True when the charge was fully 3DS-authenticated (`three_d_secure.result === 'authenticated'`). */
  three_ds_authenticated?: boolean;
}

export interface IPaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentIntent>;
  cancelPayment(intentId: string): Promise<void>;
  getPaymentIntent(intentId: string): Promise<PaymentIntent>;
}
