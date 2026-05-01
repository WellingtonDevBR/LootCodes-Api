import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IGeoRestrictionRepository } from '../../../ports/geo-restriction-repository.port.js';
import type { RestrictedVariant } from '../product.types.js';

@injectable()
export class GetRestrictedVariantsUseCase {
  constructor(
    @inject(TOKENS.GeoRestrictionRepository) private geoRepo: IGeoRestrictionRepository,
  ) {}

  async execute(productId: string, countryCode: string): Promise<RestrictedVariant[]> {
    return this.geoRepo.getRestrictedVariants(productId, countryCode);
  }
}
