import type { PromoValidationResult, CartItem } from '../use-cases/checkout/checkout.types.js';

export interface PromoValidateContext {
  userId?: string;
  guestEmail?: string;
  checkoutCurrency?: string;
}

export interface IPromoCodeValidator {
  validate(
    code: string,
    items: CartItem[],
    ctx?: PromoValidateContext,
  ): Promise<PromoValidationResult>;
  recordUsage(code: string, orderId: string, userId?: string): Promise<void>;
}
