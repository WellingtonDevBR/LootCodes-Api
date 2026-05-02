import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../../di/tokens.js';
import type { IDatabase } from '../../../ports/database.port.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';
import type { GetProductBySlugUseCase } from './get-product-by-slug.use-case.js';
import type { GetBatchRecommendationsUseCase } from '../../recommendations/get-batch-recommendations.use-case.js';
import type { GetProductRatingUseCase } from '../../reviews/get-product-rating.use-case.js';
import type { IGeoRestrictionRepository } from '../../../ports/geo-restriction-repository.port.js';
import type { StorefrontProductPageData, StorefrontVariant, RecommendationsBatch } from '../product.types.js';
import type { ProductRating } from '../../reviews/review.types.js';
import { createLogger } from '../../../../shared/logger.js';

const logger = createLogger('get-composite-product-page');

const ALLOWED_CURRENCIES = new Set(
  ['USD', 'EUR', 'GBP', 'BRL', 'AUD', 'CAD', 'JPY', 'CNY', 'INR', 'MXN'],
);

const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedPriceMatchConfig: { data: Record<string, unknown>; fetchedAt: number } | null = null;

export interface CompositeProductPageResult {
  product: StorefrontProductPageData['product'];
  variants: StorefrontVariant[];
  gallery: StorefrontProductPageData['gallery'];
  stock_status: Record<string, boolean>;
  matchedVariantId?: string | null;
  displayCurrency?: string;
  rating: ProductRating;
  region_allowed: Record<string, boolean>;
  recommendations: RecommendationsBatch;
  price_match_config: Record<string, unknown> | null;
}

@injectable()
export class GetCompositeProductPageUseCase {
  constructor(
    @inject(UC_TOKENS.GetProductBySlug) private getBySlug: GetProductBySlugUseCase,
    @inject(UC_TOKENS.GetProductRating) private getRating: GetProductRatingUseCase,
    @inject(UC_TOKENS.GetBatchRecommendations) private getBatchRecs: GetBatchRecommendationsUseCase,
    @inject(TOKENS.GeoRestrictionRepository) private geoRepo: IGeoRestrictionRepository,
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(slug: string, country?: string, currency?: string): Promise<CompositeProductPageResult> {
    const pageData = await this.getBySlug.execute(slug);

    const productId = pageData.product.id;
    const uniqueRegionIds = [...new Set(pageData.variants.map((v: StorefrontVariant) => v.region?.id).filter(Boolean))] as string[];

    const [rating, recommendations, regionAllowed, priceMatchConfig] = await Promise.all([
      this.getRating.execute(productId),
      this.getBatchRecs.execute(productId).catch((err) => {
        logger.warn('Recommendations fetch failed, returning empty', { productId, error: String(err) });
        return { similar: [], also_viewed: [], bought_together: [] } as RecommendationsBatch;
      }),
      this.resolveRegionAllowed(uniqueRegionIds, country),
      this.getPriceMatchConfig(),
    ]);

    const rawCurrency = (currency ?? 'USD').toUpperCase();
    const displayCurrency = ALLOWED_CURRENCIES.has(rawCurrency) ? rawCurrency : 'USD';

    let variants = pageData.variants;
    if (displayCurrency !== 'USD') {
      try {
        const variantIds = variants.map((v: StorefrontVariant) => v.id);
        const priceMap = await this.pricingRepo.getBatchPrices(variantIds, displayCurrency);
        variants = variants.map((v: StorefrontVariant) => {
          const localized = priceMap.get(v.id);
          if (!localized) return v;
          return {
            ...v,
            displayPriceCents: localized.price_cents,
            displayRetailCents: v.retail_price_usd != null
              ? Math.round((v.retail_price_usd / v.price_usd) * localized.price_cents)
              : undefined,
            displayCurrency,
          };
        });
      } catch (err) {
        logger.warn('Localized pricing failed, using USD', { displayCurrency, error: String(err) });
      }
    }

    return {
      product: pageData.product,
      variants,
      gallery: pageData.gallery,
      stock_status: pageData.stock_status,
      matchedVariantId: pageData.matchedVariantId,
      displayCurrency,
      rating,
      region_allowed: regionAllowed,
      recommendations,
      price_match_config: priceMatchConfig,
    };
  }

  private async resolveRegionAllowed(regionIds: string[], country?: string): Promise<Record<string, boolean>> {
    if (!country || regionIds.length === 0) return {};
    const results: Record<string, boolean> = {};
    await Promise.all(
      regionIds.map(async (regionId) => {
        try {
          results[regionId] = await this.geoRepo.isCountryAllowed(regionId, country);
        } catch {
          results[regionId] = true;
        }
      }),
    );
    return results;
  }

  private async getPriceMatchConfig(): Promise<Record<string, unknown> | null> {
    const now = Date.now();
    if (cachedPriceMatchConfig && (now - cachedPriceMatchConfig.fetchedAt) < CONFIG_CACHE_TTL_MS) {
      return cachedPriceMatchConfig.data;
    }
    try {
      const rows = await this.db.query<{ config_value: Record<string, unknown> }>('security_config', {
        select: 'config_value',
        eq: [['config_key', 'price_match_config']],
        limit: 1,
      });
      const config = rows[0]?.config_value ?? null;
      if (config) {
        cachedPriceMatchConfig = { data: config, fetchedAt: now };
      }
      return config;
    } catch (err) {
      logger.warn('Failed to fetch price_match_config', { error: String(err) });
      return cachedPriceMatchConfig?.data ?? null;
    }
  }
}
