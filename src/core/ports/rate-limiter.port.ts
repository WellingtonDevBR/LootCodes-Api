export interface RateLimitCheckResult {
  allowed: boolean;
}

export interface RateLimitConfig {
  perIpHourly: number;
  perEmailHourly?: number;
  perFingerprintHourly?: number;
  perUnknownIpHourly: number;
}

export interface IRateLimiter {
  getConfig(configKey: string): Promise<RateLimitConfig>;

  check(params: {
    userId?: string | null;
    ipAddress: string;
    endpoint: string;
    limit: number;
    windowMinutes: number;
  }): Promise<RateLimitCheckResult>;
}
