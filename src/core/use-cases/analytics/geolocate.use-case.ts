import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IGeoService } from '../../ports/geo-service.port.js';
import type { GeoLookupResult } from './analytics.types.js';

@injectable()
export class GeolocateUseCase {
  constructor(
    @inject(TOKENS.GeoService) private geoService: IGeoService,
  ) {}

  async execute(ipAddress: string): Promise<GeoLookupResult> {
    return this.geoService.lookupIp(ipAddress);
  }
}
