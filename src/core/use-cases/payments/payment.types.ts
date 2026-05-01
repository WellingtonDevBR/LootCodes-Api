export interface VerifyPaymentDto {
  payment_intent_id: string;
  order_id?: string;
  recaptcha_token?: string;
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

export interface PaymentVerificationResult {
  status: 'fulfilled' | 'held' | 'blocked' | 'pending_verification' | 'error';
  order_id?: string;
  message?: string;
}

export interface FulfillmentResult {
  fulfilled: boolean;
  order_id: string;
  keys_delivered?: number;
}

export interface CapturePaymentDto {
  payment_intent_id: string;
  order_id?: string;
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
