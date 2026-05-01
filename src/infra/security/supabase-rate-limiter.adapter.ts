import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IRateLimiter, RateLimitConfig, RateLimitCheckResult } from '../../core/ports/rate-limiter.port.js';

const DEFAULT_CONFIG: RateLimitConfig = {
  perIpHourly: 30,
  perUnknownIpHourly: 5,
};

@injectable()
export class SupabaseRateLimiterAdapter implements IRateLimiter {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getConfig(configKey: string): Promise<RateLimitConfig> {
    try {
      const raw = await this.db.rpc<Record<string, number>>('get_security_config', {
        p_config_key: configKey,
      });
      if (!raw) return DEFAULT_CONFIG;

      return {
        perIpHourly: raw.per_ip_hourly ?? DEFAULT_CONFIG.perIpHourly,
        perEmailHourly: raw.per_email_hourly,
        perFingerprintHourly: raw.per_fingerprint_hourly,
        perUnknownIpHourly: raw.per_unknown_ip_hourly ?? DEFAULT_CONFIG.perUnknownIpHourly,
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async check(params: {
    userId?: string | null;
    ipAddress: string;
    endpoint: string;
    limit: number;
    windowMinutes: number;
  }): Promise<RateLimitCheckResult> {
    const result = await this.db.rpc<{ allowed: boolean }>('check_rate_limit', {
      p_user_id: params.userId ?? null,
      p_ip_address: params.ipAddress,
      p_endpoint: params.endpoint,
      p_limit: params.limit,
      p_window_minutes: params.windowMinutes,
      p_success: true,
      p_metadata: {},
      p_ip_context: params.ipAddress,
    });

    return { allowed: result.allowed };
  }
}
