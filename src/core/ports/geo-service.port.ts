import type { GeoLookupResult } from '../services/analytics/analytics.types.js';

export interface IGeoService {
  lookupIp(ipAddress: string): Promise<GeoLookupResult>;
}
