import { injectable } from 'tsyringe';
import type { IGeoService } from '../../core/ports/geo-service.port.js';
import type { GeoLookupResult } from '../../core/services/analytics/analytics.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-geo-service');

@injectable()
export class StubGeoServiceAdapter implements IGeoService {
  async lookupIp(ipAddress: string): Promise<GeoLookupResult> {
    logger.debug('Stub geo lookup', { ipAddress });
    return { country_code: 'unknown' };
  }
}
