import type { CartItem, StockCheckResult } from '../services/checkout/checkout.types.js';

export interface ICartValidator {
  validateItems(items: CartItem[]): Promise<void>;
  checkStock(items: CartItem[]): Promise<StockCheckResult[]>;
}
