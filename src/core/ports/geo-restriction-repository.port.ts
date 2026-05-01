import type { ExcludedCountry, RestrictedVariant, RestrictedRegion } from '../use-cases/products/product.types.js';

export interface IGeoRestrictionRepository {
  isCountryAllowed(regionId: string, countryCode: string): Promise<boolean>;
  getExcludedCountries(regionId: string): Promise<ExcludedCountry[]>;
  getRestrictedVariants(productId: string, countryCode: string): Promise<RestrictedVariant[]>;
  getRestrictedRegions(countryCode: string): Promise<RestrictedRegion[]>;
}
