import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IPricingRepository } from '../../core/ports/pricing-repository.port.js';
import type { LocalizedPrice } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('SupabasePricingRepository');

interface FixedPriceRow {
  variant_id: string;
  price_cents: number;
  currency: string;
  auto_generated?: boolean;
  exchange_rate_used?: number;
}

interface RpcPriceResult {
  price_cents: number;
  currency: string;
  auto_generated?: boolean;
  exchange_rate_used?: number;
}

@injectable()
export class SupabasePricingRepository implements IPricingRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getPrice(variantId: string, currency: string): Promise<LocalizedPrice | null> {
    logger.debug('Getting price', { variantId, currency });

    const fixedPrice = await this.db.queryOne<FixedPriceRow>('fixed_prices', {
      eq: [
        ['variant_id', variantId],
        ['currency', currency],
        ['is_active', true],
      ],
      filter: { country_code: null, region_id: null },
    });

    if (fixedPrice) {
      return {
        price_cents: fixedPrice.price_cents,
        currency: fixedPrice.currency,
        auto_generated: fixedPrice.auto_generated,
        exchange_rate_used: fixedPrice.exchange_rate_used,
      };
    }

    const rpcResult = await this.db.rpc<RpcPriceResult>('get_variant_price', {
      p_variant_id: variantId,
      p_currency_code: currency,
    });

    if (!rpcResult) {
      return null;
    }

    return {
      price_cents: rpcResult.price_cents,
      currency: rpcResult.currency,
      auto_generated: rpcResult.auto_generated,
      exchange_rate_used: rpcResult.exchange_rate_used,
    };
  }

  async getBatchPrices(variantIds: string[], currency: string): Promise<Map<string, LocalizedPrice>> {
    logger.debug('Getting batch prices', { count: variantIds.length, currency });

    const results = new Map<string, LocalizedPrice>();

    if (variantIds.length === 0) {
      return results;
    }

    const rows = await this.db.query<FixedPriceRow>('fixed_prices', {
      in: [['variant_id', variantIds]],
      eq: [
        ['currency', currency],
        ['is_active', true],
      ],
      filter: { country_code: null, region_id: null },
    });

    for (const row of rows) {
      results.set(row.variant_id, {
        price_cents: row.price_cents,
        currency: row.currency,
        auto_generated: row.auto_generated,
        exchange_rate_used: row.exchange_rate_used,
      });
    }

    return results;
  }

  async hasPricesForCurrency(currency: string): Promise<boolean> {
    logger.debug('Checking prices exist for currency', { currency });

    const rows = await this.db.query<FixedPriceRow>('fixed_prices', {
      eq: [
        ['currency', currency],
        ['is_active', true],
      ],
      limit: 1,
    });

    return rows.length > 0;
  }

  async syncRates(): Promise<{ rates?: Record<string, number>; currencies?: string[] } | null> {
    logger.info('Syncing currency rates');
    return this.db.rpc<{ rates?: Record<string, number>; currencies?: string[] } | null>(
      'sync_currency_rates_for_consistency',
    );
  }
}
