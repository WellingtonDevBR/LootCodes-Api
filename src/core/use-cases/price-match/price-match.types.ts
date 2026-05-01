export interface PriceMatchClaimSubmission {
  variant_id: string;
  competitor_url: string;
  competitor_price_cents: number;
  competitor_currency: string;
  display_currency: string;
  screenshot_base64: string;
  screenshot_mime: string;
  user_id: string | null;
  guest_email: string | null;
  fingerprint_hash?: string;
}

export interface PriceMatchClaimResult {
  success: boolean;
  claim_id: string;
  expires_at: string;
}

export interface PriceMatchClaim {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  product_id: string;
  variant_id: string;
  competitor_host: string;
  competitor_url: string;
  competitor_price_cents: number;
  competitor_currency: string;
  competitor_price_usd_cents: number;
  our_price_usd_cents: number;
  our_price_display_cents: number;
  display_currency: string;
  discount_type: string | null;
  discount_value: number | null;
  beat_percentage: number | null;
  promo_code_id: string | null;
  rejection_reason: string | null;
  expires_at: string;
  created_at: string;
}

export interface PriceMatchConfig {
  enabled: boolean;
  max_claims_per_user: number;
  max_discount_percent: number;
  [key: string]: unknown;
}
