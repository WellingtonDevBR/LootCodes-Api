import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IPromoCodeValidator } from '../../core/ports/promo-code-validator.port.js';
import type { PromoValidationResult, CartItem } from '../../core/use-cases/checkout/checkout.types.js';

@injectable()
export class SupabasePromoCodeValidatorAdapter implements IPromoCodeValidator {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async validate(code: string, items: CartItem[], userId?: string): Promise<PromoValidationResult> {
    const result = await this.db.rpc<PromoValidationResult>('validate_promo_code_v2', {
      p_code: code,
      p_items: items,
      p_user_id: userId ?? null,
    });

    return result;
  }

  async recordUsage(code: string, orderId: string, userId?: string): Promise<void> {
    await this.db.rpc('record_promo_usage', {
      p_code: code,
      p_order_id: orderId,
      p_user_id: userId ?? null,
    });
  }
}
