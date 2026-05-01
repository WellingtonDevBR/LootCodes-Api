import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IGeoRestrictionRepository } from '../../../ports/geo-restriction-repository.port.js';
import type { RestrictedRegion } from '../product.types.js';

@injectable()
export class GetRestrictedRegionsUseCase {
  constructor(
    @inject(TOKENS.GeoRestrictionRepository) private geoRepo: IGeoRestrictionRepository,
  ) {}

  async execute(countryCode: string): Promise<RestrictedRegion[]> {
    return this.geoRepo.getRestrictedRegions(countryCode);
  }
}
