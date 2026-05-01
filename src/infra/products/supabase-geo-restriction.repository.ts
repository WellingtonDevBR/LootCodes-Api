import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IGeoRestrictionRepository } from '../../core/ports/geo-restriction-repository.port.js';
import type { ExcludedCountry, RestrictedVariant, RestrictedRegion } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('SupabaseGeoRestrictionRepository');

@injectable()
export class SupabaseGeoRestrictionRepository implements IGeoRestrictionRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async isCountryAllowed(regionId: string, countryCode: string): Promise<boolean> {
    logger.debug('Checking if country is allowed for region', { regionId, countryCode });

    const result = await this.db.rpc<boolean>('is_country_allowed_for_region', {
      region_uuid: regionId,
      country_code_param: countryCode,
    });

    return result ?? false;
  }

  async getExcludedCountries(regionId: string): Promise<ExcludedCountry[]> {
    logger.debug('Getting excluded countries for region', { regionId });

    const result = await this.db.rpc<ExcludedCountry[]>('get_excluded_countries_for_region', {
      region_uuid: regionId,
    });

    return result ?? [];
  }

  async getRestrictedVariants(productId: string, countryCode: string): Promise<RestrictedVariant[]> {
    logger.debug('Getting restricted variants', { productId, countryCode });

    const result = await this.db.rpc<RestrictedVariant[]>('get_restricted_variants_for_product', {
      product_uuid: productId,
      country_code_param: countryCode,
    });

    return result ?? [];
  }

  async getRestrictedRegions(countryCode: string): Promise<RestrictedRegion[]> {
    logger.debug('Getting restricted regions for country', { countryCode });

    const result = await this.db.rpc<RestrictedRegion[]>('get_restricted_regions_for_country', {
      country_code_param: countryCode,
    });

    return result ?? [];
  }
}
