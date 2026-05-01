import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentProvider } from '../../ports/payment-provider.port.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { ICartValidator } from '../../ports/cart-validator.port.js';
import type { IRateLimiter } from '../../ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../ports/ip-blocklist.port.js';
import type { CheckoutInitDto, CheckoutResult } from './checkout.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { enforceCheckoutSecurity } from '../_shared/checkout-security.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('initialize-checkout-use-case');

@injectable()
export class InitializeCheckoutUseCase {
  constructor(
    @inject(TOKENS.PaymentProvider) private paymentProvider: IPaymentProvider,
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
    @inject(TOKENS.CartValidator) private cartValidator: ICartValidator,
    @inject(TOKENS.RateLimiter) private rateLimiter: IRateLimiter,
    @inject(TOKENS.IpBlocklist) private ipBlocklist: IIpBlocklist,
  ) {}

  async execute(
    dto: CheckoutInitDto,
    userId?: string,
    ipAddress?: string,
  ): Promise<CheckoutResult> {
    if (!dto.items.length) {
      throw new ValidationError('Cart is empty');
    }

    if (ipAddress) {
      await enforceCheckoutSecurity(ipAddress, this.ipBlocklist, this.rateLimiter);
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
}
