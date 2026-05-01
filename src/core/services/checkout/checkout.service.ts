import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentProvider } from '../../ports/payment-provider.port.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { ICartValidator } from '../../ports/cart-validator.port.js';
import type { IRateLimiter } from '../../ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../ports/ip-blocklist.port.js';
import type { ICheckoutService } from '../../ports/checkout-service.port.js';
import type {
  CheckoutInitDto,
  CheckoutResult,
  CheckoutUpdateDto,
  PromoValidationResult,
} from './checkout.types.js';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
} from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('checkout-service');

@injectable()
export class CheckoutService implements ICheckoutService {
  constructor(
    @inject(TOKENS.PaymentProvider) private paymentProvider: IPaymentProvider,
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
    @inject(TOKENS.CartValidator) private cartValidator: ICartValidator,
    @inject(TOKENS.RateLimiter) private rateLimiter: IRateLimiter,
    @inject(TOKENS.IpBlocklist) private ipBlocklist: IIpBlocklist,
  ) {}

  async initializeCheckout(
    dto: CheckoutInitDto,
    userId?: string,
    ipAddress?: string,
  ): Promise<CheckoutResult> {
    if (!dto.items.length) {
      throw new ValidationError('Cart is empty');
    }

    if (ipAddress) {
      await this.checkSecurity(ipAddress);
    }

    await this.cartValidator.validateItems(dto.items);

    const stockResults = await this.cartValidator.checkStock(dto.items);
    const outOfStock = stockResults.filter((s) => !s.available);
    if (outOfStock.length > 0) {
      const ids = outOfStock.map((s) => s.variant_id).join(', ');
      throw new ValidationError(`Items out of stock: ${ids}`);
    }

    let totalCents = stockResults.reduce((sum, s) => sum + s.available_quantity, 0);
    let promoDiscount = 0;

    if (dto.promo_code) {
      const promoResult = await this.promoValidator.validate(dto.promo_code, dto.items, userId);
      if (promoResult.valid) {
        promoDiscount = promoResult.discount_cents;
      }
    }

    totalCents = Math.max(totalCents - promoDiscount, 1);
    const currency = dto.currency ?? 'usd';

    const paymentIntent = await this.paymentProvider.createPaymentIntent({
      amount_cents: totalCents,
      currency,
      metadata: {
        user_id: userId ?? '',
        session_id: dto.session_id ?? '',
      },
    });

    const order = await this.checkoutRepo.createOrder({
      user_id: userId,
      session_id: dto.session_id,
      items: dto.items,
      total_cents: totalCents,
      currency,
      payment_intent_id: paymentIntent.id,
      promo_code: dto.promo_code,
    });

    logger.info('Checkout initialized', { orderId: order.id, totalCents, currency });

    return {
      order_id: order.id,
      client_secret: paymentIntent.client_secret,
      total_cents: totalCents,
      currency,
    };
  }

  async updateCheckout(dto: CheckoutUpdateDto, userId?: string): Promise<CheckoutResult> {
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

  async cancelCheckout(orderId: string, userId?: string): Promise<void> {
    const existingOrder = await this.checkoutRepo.getOrder(orderId);
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    if (userId && existingOrder.user_id && existingOrder.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    if (existingOrder.payment_intent_id) {
      await this.paymentProvider.cancelPayment(existingOrder.payment_intent_id as string);
    }

    await this.checkoutRepo.cancelOrder(orderId);
    logger.info('Checkout cancelled', { orderId });
  }

  async validatePromoCode(
    code: string,
    items: { variant_id: string; quantity: number }[],
    userId?: string,
  ): Promise<PromoValidationResult> {
    return this.promoValidator.validate(code, items, userId);
  }

  private async checkSecurity(ipAddress: string): Promise<void> {
    try {
      const blocked = await this.ipBlocklist.isBlocked(ipAddress);
      if (blocked) throw new ForbiddenError('Access denied');
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
    }

    try {
      const config = await this.rateLimiter.getConfig('rate_limit_checkout');
      const result = await this.rateLimiter.check({
        ipAddress,
        endpoint: 'checkout',
        limit: config.perIpHourly,
        windowMinutes: 60,
      });

      if (!result.allowed) {
        throw new RateLimitError('Too many checkout attempts', 60);
      }
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      logger.warn('Checkout rate limit check failed', err as Error);
    }
  }
}
