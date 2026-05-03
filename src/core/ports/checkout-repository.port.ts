import type {
  BillingAddressPayload,
  CartItem,
  PaymentMethodsConfig,
} from '../use-cases/checkout/checkout.types.js';

export interface CreateOrderParams {
  user_id?: string;
  session_id?: string | null;
  ip_address?: string | null;
  payment_provider: string;
  items: CartItem[];
  /** Pre-discount merchandise subtotal in USD cents. */
  subtotal_cents: number;
  discount_amount_cents: number;
  /** Charged total in cents (matches PaymentIntent minor units). */
  total_amount_cents: number;
  currency: string;
  promo_code_id?: string | null;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddressPayload | null;
}

export interface ICheckoutRepository {
  createOrder(params: CreateOrderParams): Promise<{ id: string; order_number: string | null }>;
  replaceOrderItems(orderId: string, items: CartItem[]): Promise<void>;
  updateOrder(orderId: string, data: Record<string, unknown>): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<Record<string, unknown> | null>;
  getPaymentMethodsConfig(): Promise<PaymentMethodsConfig>;
}
