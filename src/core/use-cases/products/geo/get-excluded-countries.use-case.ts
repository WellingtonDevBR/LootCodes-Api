import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IGeoRestrictionRepository } from '../../../ports/geo-restriction-repository.port.js';
import type { ExcludedCountry } from '../product.types.js';

@injectable()
export class GetExcludedCountriesUseCase {
  constructor(
    @inject(TOKENS.GeoRestrictionRepository) private geoRepo: IGeoRestrictionRepository,
  ) {}

  async execute(regionId: string): Promise<ExcludedCountry[]> {
    return this.geoRepo.getExcludedCountries(regionId);
  }
}
