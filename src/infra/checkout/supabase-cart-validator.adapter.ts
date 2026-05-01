import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ICartValidator } from '../../core/ports/cart-validator.port.js';
import type { CartItem, StockCheckResult } from '../../core/use-cases/checkout/checkout.types.js';
import { ValidationError } from '../../core/errors/domain-errors.js';

@injectable()
export class SupabaseCartValidatorAdapter implements ICartValidator {
  async validateItems(items: CartItem[]): Promise<void> {
    if (!items.length) {
      throw new ValidationError('Cart is empty');
    }

    for (const item of items) {
      if (!item.variant_id || item.quantity < 1) {
        throw new ValidationError('Invalid cart item: variant_id and positive quantity required');
      }
    }
  }

  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async checkStock(items: CartItem[]): Promise<StockCheckResult[]> {
    return this.db.rpc<StockCheckResult[]>('check_cart_stock', {
      p_items: items,
    });
  }
}
