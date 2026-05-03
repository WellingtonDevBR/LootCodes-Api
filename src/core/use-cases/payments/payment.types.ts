export interface VerifyPaymentDto {
  payment_intent_id: string;
  order_id?: string;
  recaptcha_token?: string;
  /** When true and no token, Edge treats as reCAPTCHA genuinely unavailable — elevated risk penalties apply */
  recaptcha_unavailable?: boolean;
  /** Optional client hint (`ios` | `android`) for future Enterprise mobile key routing; web omits */
  recaptcha_platform?: string;
  session_id?: string;
  fingerprint_hash?: string;
}

export interface RiskAssessmentInput {
  order_id: string;
  payment_intent_id: string;
  client_ip: string;
  user_agent: string;
  user_id?: string;
  fingerprint_hash?: string;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  should_hold: boolean;
  should_block: boolean;
}

/** Internal result from checking the payment provider (Stripe/PayPal). */
export interface ProviderPaymentStatus {
  status: 'fulfilled' | 'processing' | 'requires_action' | 'canceled' | 'error';
  order_id?: string;
  message?: string;
  card_last4?: string | null;
  /** True when the charge was fully 3DS-authenticated (Stripe) or SCA-equivalent (PayPal wallet). */
  three_ds_authenticated?: boolean;
}

/**
 * Response shape for /payments/verify — must match the frontend
 * `VerificationResult` interface in EnhancedPaymentProcessing.tsx.
 *
 * The Edge function `payment-verification` is the canonical source;
 * keep status values in sync with its handler responses.
 */
export interface PaymentVerificationResult {
  success: boolean;
  status:
    | 'verified'
    | 'pending_fulfillment'
    | 'processing'
    | 'security_review'
    | 'requires_verification'
    | 'blocked'
    | 'session_expired'
    | 'requires_card_challenge'
    | 'requires_verification_choice'
    | 'failed'
    | 'error';
  order_id?: string;
  order_number?: string;
  message?: string;
  error?: string;
  /** Mirrors Edge responses (e.g. RECAPTCHA_REQUIRED) */
  code?: string;
  ticket_number?: string;
  access_token?: string;
  guest_email?: string;
  keys_assigned?: number;
  total_keys?: number;
  security_hold?: boolean;
  /** True when escalated for medium/high risk manual review (not first-time-ID path). Mirrors Edge payment-verification. */
  security_review_required?: boolean;
  funding_source?: string | null;
  processing_reason?: string;
  /** Card last4 when available from Stripe (hold / UX parity with Edge) */
  card_last4?: string | null;
  /** Verification options the frontend should offer ('confirm_amount' = card hold, 'upload_id' = ID upload). */
  options?: Array<'confirm_amount' | 'upload_id'>;
}

export interface FulfillmentResult {
  fulfilled: boolean;
  order_id: string;
  order_number?: string;
  keys_delivered?: number;
  access_token?: string;
  guest_email?: string;
  security_hold?: boolean;
}

export interface CapturePaymentDto {
  payment_intent_id: string;
  order_id?: string;
  provider?: 'stripe' | 'paypal';
}

export interface CaptureResult {
  captured: boolean;
  payment_intent_id: string;
  amount_cents?: number;
  currency?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  provider: 'stripe' | 'paypal';
  payload: Record<string, unknown>;
  created_at: string;
}

export interface WebhookProcessResult {
  processed: boolean;
  event_id: string;
  action_taken?: string;
}
