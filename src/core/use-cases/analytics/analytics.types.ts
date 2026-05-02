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

export interface SessionUpsertDto {
  session_id: string;
  user_id?: string;
  page_path?: string;
  referrer?: string;
  traffic_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  language?: string;
  country_code?: string;
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
