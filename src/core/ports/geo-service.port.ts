import type { GeoLookupResult } from '../use-cases/analytics/analytics.types.js';

export interface IGeoService {
  lookupIp(ipAddress: string): Promise<GeoLookupResult>;
}
