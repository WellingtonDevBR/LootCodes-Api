/**
 * Port for proxying buyer card-challenge requests to the upstream
 * verification provider (currently Supabase Edge `card-challenge`).
 *
 * The backend does NOT re-implement Stripe micro-auth domain logic —
 * it validates + forwards the buyer's request and returns the upstream
 * response verbatim. Swapping the upstream (e.g. from Edge Function to
 * a self-hosted service) only requires a new adapter.
 */
export interface ProxyRequest {
  /** Already-validated body matching the upstream contract. */
  readonly body: Record<string, unknown>;
  /** Incoming Authorization header (Bearer JWT or absent). */
  readonly authorization?: string;
  /** Origin header for upstream origin validation. */
  readonly origin?: string;
  /** Client IP headers for upstream rate limiting / audit. */
  readonly ipHeaders: Readonly<Record<string, string>>;
  /** User-Agent string. */
  readonly userAgent?: string;
  /** X-Requested-By channel identifier. */
  readonly requestedBy?: string;
}

export interface ProxyResponse {
  readonly status: number;
  readonly payload: unknown;
}

export interface IBuyerCardChallengeProxy {
  forward(request: ProxyRequest): Promise<ProxyResponse>;
}
