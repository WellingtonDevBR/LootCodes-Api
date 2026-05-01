import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { ICartValidator } from '../../ports/cart-validator.port.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { CheckoutUpdateDto, CheckoutResult } from './checkout.types.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-checkout-use-case');

@injectable()
export class UpdateCheckoutUseCase {
  constructor(
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.CartValidator) private cartValidator: ICartValidator,
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
  ) {}

  async execute(dto: CheckoutUpdateDto, userId?: string): Promise<CheckoutResult> {
    const existingOrder = await this.checkoutRepo.getOrder(dto.order_id);
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    if (userId && existingOrder.user_id && existingOrder.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    const items = dto.items ?? (existingOrder.items as { variant_id: string; quantity: number }[]);

    if (dto.items) {
      await this.cartValidator.validateItems(dto.items);
      const stockResults = await this.cartValidator.checkStock(dto.items);
      const outOfStock = stockResults.filter((s) => !s.available);
      if (outOfStock.length > 0) {
        throw new ValidationError('Some items are out of stock');
      }
    }

    let totalCents = existingOrder.total_cents as number;

    if (dto.promo_code) {
      const promoResult = await this.promoValidator.validate(dto.promo_code, items, userId);
      if (promoResult.valid) {
        totalCents = Math.max(totalCents - promoResult.discount_cents, 1);
      }
    }

    await this.checkoutRepo.updateOrder(dto.order_id, {
      total_cents: totalCents,
      promo_code: dto.promo_code ?? null,
    });

    logger.info('Checkout updated', { orderId: dto.order_id, totalCents });

    return {
      order_id: dto.order_id,
      client_secret: existingOrder.client_secret as string,
      total_cents: totalCents,
      currency: existingOrder.currency as string,
    };
  }
}
