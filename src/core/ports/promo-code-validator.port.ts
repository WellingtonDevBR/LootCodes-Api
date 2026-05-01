import type { PromoValidationResult, CartItem } from '../services/checkout/checkout.types.js';

export interface IPromoCodeValidator {
  validate(code: string, items: CartItem[], userId?: string): Promise<PromoValidationResult>;
  recordUsage(code: string, orderId: string, userId?: string): Promise<void>;
}
