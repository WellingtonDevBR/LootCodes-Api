import { getEnv } from '../../config/env.js';
import { InternalError, PaymentError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('paypal-client');

interface OAuthToken {
  access_token: string;
  expires_at: number;
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 250;

export class PayPalApiError extends Error {
  readonly status: number;
  readonly debugId: string | null;
  readonly operation: string;
  readonly responseBody: string;

  constructor(operation: string, status: number, debugId: string | null, responseBody: string) {
    super(
      `PayPal ${operation} failed: status=${status} debug_id=${debugId ?? 'none'} body=${responseBody.slice(0, 500)}`,
    );
    this.name = 'PayPalApiError';
    this.operation = operation;
    this.status = status;
    this.debugId = debugId;
    this.responseBody = responseBody;
  }
}

export class PayPalClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  readonly baseUrl: string;
  private tokenCache: OAuthToken | null = null;

  constructor() {
    const env = getEnv();
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      throw new InternalError(
        'PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not configured — cannot initialize PayPal client',
      );
    }
    this.clientId = env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET;

    const explicitEnv = env.PAYPAL_ENVIRONMENT;
    const runtimeEnv = env.NODE_ENV;
    let envName: 'sandbox' | 'live';
    if (explicitEnv === 'sandbox' || explicitEnv === 'live') {
      envName = explicitEnv;
    } else if (runtimeEnv === 'production') {
      throw new InternalError(
        'PAYPAL_ENVIRONMENT must be set to "live" or "sandbox" explicitly in production',
      );
    } else {
      envName = 'sandbox';
    }
    this.baseUrl = envName === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  getPublishableKey(): string {
    return this.clientId;
  }

  private async retryFetch(exec: () => Promise<Response>, operation: string): Promise<Response> {
    let lastResponse: Response | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await exec();
        if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
          return response;
        }
        lastResponse = response;
      } catch (err) {
        if (attempt === MAX_ATTEMPTS) throw err;
      }

      if (attempt < MAX_ATTEMPTS) {
        const jitter = Math.random() * 100;
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (!lastResponse) throw new PaymentError(`PayPal ${operation} failed after retries`);
    return lastResponse;
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expires_at > Date.now() + 60_000) {
      return this.tokenCache.access_token;
    }
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await this.retryFetch(
      () => fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }),
      'OAuth',
    );
    if (!response.ok) {
      const body = await response.text();
      throw new PayPalApiError('OAuth', response.status, response.headers.get('paypal-debug-id'), body);
    }
    const json = await response.json() as { access_token: string; expires_in: number };
    this.tokenCache = {
      access_token: json.access_token,
      expires_at: Date.now() + (json.expires_in * 1000),
    };
    return json.access_token;
  }

  async request(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getAccessToken();
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return this.retryFetch(
      () => fetch(`${this.baseUrl}${path}`, { ...init, headers }),
      `API ${path}`,
    );
  }

  async toApiError(response: Response, operation: string): Promise<PayPalApiError> {
    const body = await response.text().catch(() => '');
    return new PayPalApiError(operation, response.status, response.headers.get('paypal-debug-id'), body);
  }

  idempotencyKey(parts: Array<string | number | undefined>): string {
    return parts.map((p) => String(p ?? '')).join('|').slice(0, 80);
  }
}

let instance: PayPalClient | null = null;

export function getPayPalClient(): PayPalClient {
  if (!instance) {
    instance = new PayPalClient();
  }
  return instance;
}

export function isPayPalConfigured(): boolean {
  const env = getEnv();
  return !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
}

export function resetPayPalClient(): void {
  instance = null;
}
