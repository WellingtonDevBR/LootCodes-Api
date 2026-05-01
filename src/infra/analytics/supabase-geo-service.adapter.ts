import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IGeoService } from '../../core/ports/geo-service.port.js';
import type { GeoLookupResult } from '../../core/use-cases/analytics/analytics.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('geo-service');

const UNKNOWN_RESULT: GeoLookupResult = { country_code: 'unknown' };

const PRIVATE_PREFIXES = ['10.', '192.168.'];

function isPrivateOrLocalIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown' || ip === '') {
    return true;
  }

  if (PRIVATE_PREFIXES.some((prefix) => ip.startsWith(prefix))) {
    return true;
  }

  // 172.16.0.0 – 172.31.255.255
  if (ip.startsWith('172.')) {
    const secondOctet = parseInt(ip.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

interface IpReputationRow {
  country_code?: string;
  country_name?: string;
  city?: string;
  region?: string;
  is_vpn?: boolean;
  is_proxy?: boolean;
  risk_score?: number;
}

@injectable()
export class SupabaseGeoServiceAdapter implements IGeoService {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async lookupIp(ipAddress: string): Promise<GeoLookupResult> {
    if (!ipAddress || isPrivateOrLocalIp(ipAddress)) {
      return UNKNOWN_RESULT;
    }

    try {
      const row = await this.db.queryOne<IpReputationRow>('ip_reputation_cache', {
        select: 'country_code,country_name,city,region,is_vpn,is_proxy,risk_score',
        eq: [['ip_address', ipAddress]],
      });

      if (!row) {
        logger.debug('No cached geo data for IP', { ipAddress });
        return UNKNOWN_RESULT;
      }

      return {
        country_code: row.country_code,
        country_name: row.country_name,
        city: row.city,
        region: row.region,
        is_vpn: row.is_vpn,
        is_proxy: row.is_proxy,
        risk_score: row.risk_score,
      };
    } catch (err) {
      logger.warn('Geo lookup failed', err, { ipAddress });
      return UNKNOWN_RESULT;
    }
  }
}
