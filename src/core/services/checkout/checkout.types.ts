export interface CartItem {
  variant_id: string;
  quantity: number;
}

export interface CheckoutInitDto {
  items: CartItem[];
  currency?: string;
  promo_code?: string;
  session_id?: string;
  fingerprint_hash?: string;
  recaptcha_token?: string;
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
