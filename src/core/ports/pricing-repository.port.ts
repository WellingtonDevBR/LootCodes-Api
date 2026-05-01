import type { LocalizedPrice } from '../use-cases/products/product.types.js';

export interface IPricingRepository {
  getPrice(variantId: string, currency: string): Promise<LocalizedPrice | null>;
  getBatchPrices(variantIds: string[], currency: string): Promise<Map<string, LocalizedPrice>>;
  hasPricesForCurrency(currency: string): Promise<boolean>;
  syncRates(): Promise<{ rates?: Record<string, number>; currencies?: string[] } | null>;
}
