import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IGeoRestrictionRepository } from '../../../ports/geo-restriction-repository.port.js';

@injectable()
export class IsCountryAllowedUseCase {
  constructor(
    @inject(TOKENS.GeoRestrictionRepository) private geoRepo: IGeoRestrictionRepository,
  ) {}

  async execute(regionId: string, countryCode: string): Promise<boolean> {
    return this.geoRepo.isCountryAllowed(regionId, countryCode);
  }
}
