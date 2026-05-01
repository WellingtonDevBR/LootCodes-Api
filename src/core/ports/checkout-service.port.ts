import type { CheckoutInitDto, CheckoutResult, CheckoutUpdateDto, PromoValidationResult } from '../services/checkout/checkout.types.js';

export interface ICheckoutService {
  initializeCheckout(dto: CheckoutInitDto, userId?: string, ipAddress?: string): Promise<CheckoutResult>;
  updateCheckout(dto: CheckoutUpdateDto, userId?: string): Promise<CheckoutResult>;
  cancelCheckout(orderId: string, userId?: string): Promise<void>;
  validatePromoCode(code: string, items: { variant_id: string; quantity: number }[], userId?: string): Promise<PromoValidationResult>;
}
