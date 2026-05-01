export interface CartItem {
  variant_id: string;
  quantity: number;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface CheckoutInitDto {
  items: CartItem[];
  currency?: string;
  promo_code?: string;
  session_id?: string;
  fingerprint_hash?: string;
  recaptcha_token?: string;
  wallet_redeem_cents?: number;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddress;
}

export interface CheckoutApprovalDto {
  approval_token: string;
  hold_id: string;
  items: CartItem[];
  currency?: string;
  promo_code?: string;
  session_id?: string;
  wallet_redeem_cents?: number;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddress;
}

export interface CheckoutResult {
  order_id: string;
  client_secret: string;
  total_cents: number;
  currency: string;
}

export interface CheckoutUpdateDto {
  order_id: string;
  items?: CartItem[];
  promo_code?: string;
}

export interface PromoValidationResult {
  valid: boolean;
  discount_cents: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  message?: string;
}

export interface StockCheckResult {
  variant_id: string;
  available: boolean;
  available_quantity: number;
}

export interface PaymentMethodsConfig {
  stripe: { card: boolean; google_pay: boolean; apple_pay: boolean; link: boolean };
  paypal: { enabled: boolean };
}
