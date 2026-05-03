export interface CartItem {
  variant_id: string;
  /** Product UUID — persisted on `order_items`. */
  product_id?: string;
  quantity: number;
  /** USD cents per unit from storefront cart (required for totals; stock check validates availability separately). */
  price_usd?: number;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

/** Storefront billing shape (`street_*`) or legacy line-based fields. */
export type BillingAddressPayload =
  | BillingAddress
  | {
      street_address_1?: string;
      street_address_2?: string;
      city?: string;
      state_province?: string;
      state?: string;
      postal_code?: string;
      country_code?: string;
      country?: string;
      line1?: string;
      line2?: string;
    };

export interface CheckoutInitDto {
  items: CartItem[];
  currency?: string;
  promo_code?: string;
  session_id?: string;
  fingerprint_hash?: string;
  recaptcha_token?: string;
  wallet_redeem_cents?: number;
  payment_provider?: string;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddressPayload;
}

export interface CheckoutApprovalDto {
  approval_token: string;
  hold_id: string;
  items: CartItem[];
  currency?: string;
  promo_code?: string;
  session_id?: string;
  wallet_redeem_cents?: number;
  payment_provider?: string;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddressPayload;
}

/** Successful checkout init/update — enriched for HTTP responses. */
export interface CheckoutResult {
  success: true;
  order_id: string;
  order_number: string;
  client_secret: string;
  total_cents: number;
  currency: string;
  payment_provider: string;
  promo_code?: string | null;
  discount_amount_cents: number;
  wallet_redeem_cents: number;
}

export interface CheckoutUpdateDto {
  order_id: string;
  items: CartItem[];
  promo_code?: string;
  currency?: string;
  wallet_redeem_cents?: number;
  fingerprint_hash?: string;
  captcha_token?: string;
  recaptcha_token?: string;
  session_id?: string;
  payment_provider?: string;
  customer_email?: string;
  customer_name?: string;
  billing_address?: BillingAddressPayload;
}

export interface PromoValidationResult {
  valid: boolean;
  discount_cents: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  message?: string;
  /** When valid, Postgres row id from `promo_codes` — stored on orders as `promo_code_id`. */
  promo_code_id?: string | null;
}

export interface StockCheckResult {
  variant_id: string;
  available: boolean;
  available_quantity: number;
}

/** Mirrors `payment_methods` JSONB and Edge `sliceForProvider` slices. */
export interface StripeMethodsConfig {
  card_enabled: boolean;
  apple_pay_enabled: boolean;
  google_pay_enabled: boolean;
}

export interface PayPalMethodsConfig {
  smart_buttons_enabled: boolean;
  pay_later_enabled: boolean;
  credit_enabled: boolean;
  card_fields_enabled: boolean;
}

export interface PaymentMethodsConfig {
  stripe: StripeMethodsConfig;
  paypal: PayPalMethodsConfig;
}

export type ProviderMethodsSlice = StripeMethodsConfig | PayPalMethodsConfig;

export function slicePaymentMethodsForProvider(
  cfg: PaymentMethodsConfig,
  providerName: string,
): ProviderMethodsSlice {
  const name = providerName.trim().toLowerCase();
  if (name === 'paypal') return cfg.paypal;
  return cfg.stripe;
}
