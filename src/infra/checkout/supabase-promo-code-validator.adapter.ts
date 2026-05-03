import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type {
  IPromoCodeValidator,
  PromoValidateContext,
} from '../../core/ports/promo-code-validator.port.js';
import type { PromoValidationResult, CartItem } from '../../core/use-cases/checkout/checkout.types.js';

interface ValidatePromoRpcRow {
  id: string | null;
  code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  min_order_cents: number | null;
  max_discount_cents: number | null;
  is_valid: boolean;
  message: string | null;
  computed_discount_cents: number | null;
}

function firstRpcRow<T>(data: unknown): T | undefined {
  if (data == null) return undefined;
  if (Array.isArray(data)) return data[0] as T;
  return data as T;
}

@injectable()
export class SupabasePromoCodeValidatorAdapter implements IPromoCodeValidator {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async validate(
    code: string,
    items: CartItem[],
    ctx?: PromoValidateContext,
  ): Promise<PromoValidationResult> {
    const subtotalCents = items.reduce((sum, i) => {
      const cents = typeof i.price_usd === 'number' ? i.price_usd : 0;
      return sum + cents * Math.max(i.quantity, 1);
    }, 0);

    const cartPayload = items.map((i) => ({
      variant_id: i.variant_id,
      quantity: i.quantity,
      price_cents: typeof i.price_usd === 'number' ? i.price_usd : 0,
      product_id: i.product_id ?? null,
    }));

    const rows = await this.db.rpc<unknown>('validate_promo_code_v2', {
      p_code: code.trim(),
      p_subtotal_cents: subtotalCents,
      p_user_id: ctx?.userId ?? null,
      p_guest_email: ctx?.guestEmail?.trim()?.toLowerCase() ?? null,
      p_cart_items: cartPayload,
      p_checkout_currency: (ctx?.checkoutCurrency ?? 'USD').trim().toUpperCase(),
    });

    const row = firstRpcRow<ValidatePromoRpcRow>(rows);
    const valid = Boolean(row?.is_valid);
    const discountCents = row?.computed_discount_cents ?? 0;
    const dtype = row?.discount_type;
    let discount_type: PromoValidationResult['discount_type'];
    if (dtype === 'percentage' || dtype === 'fixed') discount_type = dtype;

    return {
      valid,
      discount_cents: typeof discountCents === 'number' ? discountCents : 0,
      discount_type,
      discount_value: row?.discount_value ?? undefined,
      message: row?.message ?? undefined,
      promo_code_id: row?.id ?? null,
    };
  }

  async recordUsage(code: string, orderId: string, userId?: string): Promise<void> {
    await this.db.rpc('record_promo_usage', {
      p_code: code,
      p_order_id: orderId,
      p_user_id: userId ?? null,
    });
  }
}
