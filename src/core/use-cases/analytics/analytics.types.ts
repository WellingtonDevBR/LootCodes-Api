export interface PageViewEvent {
  session_id: string;
  user_id?: string;
  path: string;
  referrer?: string;
  timestamp?: string;
}

export interface ActivityEvent {
  session_id: string;
  user_id?: string;
  event_type: string;
  element_id?: string;
  metadata?: Record<string, unknown>;
  page_path?: string;
  element_selector?: string;
  mouse_position?: string;
  user_agent?: string;
  timestamp?: string;
}

export interface CartEvent {
  session_id: string;
  user_id?: string;
  event_type: string;
  variant_id?: string;
  product_id?: string;
  quantity?: number;
  cart_value?: number;
  guest_email?: string;
  user_agent?: string;
  page_path?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionOutcomeDto {
  session_id: string;
  outcome: string;
  conversion_value?: number;
}

export interface GeoLookupResult {
  country_code?: string;
  country_name?: string;
  city?: string;
  region?: string;
  is_vpn?: boolean;
  is_proxy?: boolean;
  risk_score?: number;
}

export interface BatchedEventEnvelope {
  action: string;
  payload: Record<string, unknown>;
}

export interface BatchEventsDto {
  events: Array<BatchedEventEnvelope>;
}

/** Matches Postgres `upsert_user_session` (overload with `p_client_channel`) — Edge `analytics` session-upsert branch. */
export interface SessionUpsertDto {
  session_id: string;
  user_id?: string;
  /** Public IP — must be omitted or invalid becomes null for `inet`. */
  ip_address?: string | null;
  country_code?: string | null;
  city?: string | null;
  region?: string | null;
  /** ISO-ish timestamp accepted by Postgres as `timestamptz`; omit when unknown. */
  started_at?: string | null;
  user_agent?: string | null;
  merge_anonymous?: boolean;
  auto_consolidate?: boolean;
  /** `web` / `mobile_app`; `unknown` is sent as null to match Edge. */
  client_channel?: 'web' | 'mobile_app' | 'unknown' | null;
}

export interface ProductViewDurationDto {
  session_id: string;
  product_id: string;
  variant_id?: string;
  duration_seconds: number;
}

export interface SearchEventDto {
  session_id: string;
  query: string;
  results_count: number;
  filters?: Record<string, unknown>;
}
