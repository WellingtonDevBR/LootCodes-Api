import { injectable } from 'tsyringe';
import type {
  IBuyerCardChallengeProxy,
  ProxyRequest,
  ProxyResponse,
} from '../../core/ports/buyer-card-challenge-proxy.port.js';
import { getEnv } from '../../config/env.js';

/**
 * Forwards buyer card-challenge JSON to the Supabase Edge `card-challenge`
 * function unchanged. Preserves caller JWT when present; otherwise uses
 * Bearer anon — same gateway pattern as browser → Supabase Functions.
 *
 * NOTE: When this server proxies through Cloudflare, CF rewrites
 * `cf-connecting-ip` to the server IP, not the real buyer. Edge-side
 * per-client IP blocking / rate limiting will therefore see the server IP.
 * The backend applies its own per-client rate limiting and IP blocklist
 * before reaching this adapter, so this is acceptable.
 */
@injectable()
export class SupabaseBuyerCardChallengeProxyAdapter implements IBuyerCardChallengeProxy {
  async forward(request: ProxyRequest): Promise<ProxyResponse> {
    const env = getEnv();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
    };

    if (request.authorization) {
      headers.Authorization = request.authorization;
    } else {
      headers.Authorization = `Bearer ${env.SUPABASE_ANON_KEY}`;
    }

    if (request.origin) {
      headers.Origin = request.origin;
    }

    for (const [name, value] of Object.entries(request.ipHeaders)) {
      if (value.trim()) headers[name] = value;
    }

    if (request.userAgent) {
      headers['User-Agent'] = request.userAgent;
    }

    if (request.requestedBy) {
      headers['X-Requested-By'] = request.requestedBy;
    }

    const url = `${env.SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/card-challenge`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request.body),
    });

    const text = await res.text();
    let payload: unknown;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = { success: false, error: 'Invalid upstream response' };
      }
    } else {
      payload = {};
    }

    return { status: res.status, payload };
  }
}
