import type { CartItem, PaymentMethodsConfig } from '../use-cases/checkout/checkout.types.js';

export interface CreateOrderParams {
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total_cents: number;
  currency: string;
  payment_intent_id: string;
  promo_code?: string;
}

export interface ICheckoutRepository {
  createOrder(params: CreateOrderParams): Promise<{ id: string }>;
  updateOrder(orderId: string, data: Record<string, unknown>): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<Record<string, unknown> | null>;
  getPaymentMethodsConfig(): Promise<PaymentMethodsConfig>;
}
