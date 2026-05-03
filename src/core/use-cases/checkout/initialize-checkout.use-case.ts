import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPaymentProviderFactory, PaymentProviderName } from '../../ports/payment-provider-factory.port.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { ICartValidator } from '../../ports/cart-validator.port.js';
import type { IRateLimiter } from '../../ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../ports/ip-blocklist.port.js';
import type { ICustomerResolver } from '../../ports/customer-resolver.port.js';
import type { CheckoutInitDto, CheckoutResult } from './checkout.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { enforceCheckoutSecurity } from '../_shared/checkout-security.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('initialize-checkout-use-case');

function normalizePaymentProviderName(raw?: string): PaymentProviderName {
  const n = raw?.trim().toLowerCase();
  return n === 'paypal' ? 'paypal' : 'stripe';
}

@injectable()
export class InitializeCheckoutUseCase {
  constructor(
    @inject(TOKENS.PaymentProviderFactory) private providerFactory: IPaymentProviderFactory,
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
    @inject(TOKENS.CartValidator) private cartValidator: ICartValidator,
    @inject(TOKENS.RateLimiter) private rateLimiter: IRateLimiter,
    @inject(TOKENS.IpBlocklist) private ipBlocklist: IIpBlocklist,
    @inject(TOKENS.CustomerResolver) private customerResolver: ICustomerResolver,
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

    for (const item of dto.items) {
      if (!item.product_id?.trim()) {
        throw new ValidationError('Each cart item must include product_id');
      }
    }

    const stockResults = await this.cartValidator.checkStock(dto.items);
    const outOfStock = stockResults.filter((s) => !s.available);
    if (outOfStock.length > 0) {
      const ids = outOfStock.map((s) => s.variant_id).join(', ');
      throw new ValidationError(`Items out of stock: ${ids}`);
    }

    const subtotalCents = dto.items.reduce((sum, item) => {
      const unit = typeof item.price_usd === 'number' ? item.price_usd : 0;
      return sum + unit * item.quantity;
    }, 0);
    if (subtotalCents <= 0) {
      throw new ValidationError('Invalid cart subtotal');
    }

    const currencyStripe = (dto.currency ?? 'usd').trim().toLowerCase();
    const currencyOrder = currencyStripe.toUpperCase();

    if (dto.promo_code?.trim() && !userId && !(dto.customer_email?.trim())) {
      throw new ValidationError('Email is required to apply a promo code');
    }

    let discountAmountCents = 0;
    let promoCodeId: string | null = null;
    if (dto.promo_code?.trim()) {
      const promoResult = await this.promoValidator.validate(dto.promo_code.trim(), dto.items, {
        userId,
        guestEmail: dto.customer_email,
        checkoutCurrency: currencyOrder,
      });
      if (promoResult.valid) {
        discountAmountCents = promoResult.discount_cents;
        promoCodeId = promoResult.promo_code_id ?? null;
      }
    }

    const chargedCents = Math.max(subtotalCents - discountAmountCents, 1);
    const paymentProviderName = normalizePaymentProviderName(dto.payment_provider);

    if (!this.providerFactory.isProviderAvailable(paymentProviderName)) {
      throw new ValidationError(`Payment provider "${paymentProviderName}" is not available`);
    }

    const contactEmail = dto.customer_email?.trim().toLowerCase();
    // PayPal has no server-side customer concept — skip Stripe customer resolution
    const customerId = paymentProviderName === 'stripe'
      ? await this.resolveCustomerId(userId, contactEmail)
      : null;

    if (userId && customerId) {
      this.customerResolver.cacheCustomerId(userId, customerId).catch(() => {});
    }

    const draft = await this.checkoutRepo.createOrder({
      user_id: userId,
      session_id: dto.session_id ?? null,
      ip_address: ipAddress ?? null,
      payment_provider: paymentProviderName,
      items: dto.items,
      subtotal_cents: subtotalCents,
      discount_amount_cents: discountAmountCents,
      total_amount_cents: chargedCents,
      currency: currencyOrder,
      promo_code_id: promoCodeId,
      customer_email: dto.customer_email,
      customer_name: dto.customer_name,
      billing_address: dto.billing_address ?? null,
      provider_customer_id: customerId,
    });

    const provider = this.providerFactory.getProvider(paymentProviderName);
    const paymentIntent = await provider.createPaymentIntent({
      amount_cents: chargedCents,
      currency: currencyStripe,
      customer_id: customerId ?? undefined,
      metadata: {
        order_id: draft.id,
        order_number: draft.order_number ?? '',
        session_id: dto.session_id ?? '',
        user_id: userId ?? '',
      },
    });

    await this.checkoutRepo.updateOrder(draft.id, {
      provider_payment_id: paymentIntent.id,
    });

    logger.info('Checkout initialized', { orderId: draft.id, totalCents: chargedCents, currency: currencyStripe });

    return {
      success: true,
      order_id: draft.id,
      order_number: draft.order_number ?? '',
      client_secret: paymentIntent.client_secret,
      total_cents: chargedCents,
      currency: currencyStripe,
      payment_provider: paymentProviderName,
      promo_code: discountAmountCents > 0 && dto.promo_code ? dto.promo_code.trim().toUpperCase() : null,
      discount_amount_cents: discountAmountCents,
      wallet_redeem_cents: typeof dto.wallet_redeem_cents === 'number' ? dto.wallet_redeem_cents : 0,
    };
  }

  /**
   * Three-step resolution mirroring the Edge Function `create-order.ts`:
   *   1. Cached on profile (`stripe_customer_id`)
   *   2. Stripe lookup by email
   *   3. Create new Stripe Customer
   *
   * A missing customer silently collapses the card-challenge micro-auth
   * path into ID-upload-only, so we treat customer creation failure as
   * checkout-blocking (same as the Edge handler).
   */
  private async resolveCustomerId(
    userId: string | undefined,
    email: string | undefined,
  ): Promise<string | null> {
    if (!email) return null;

    if (userId) {
      try {
        const cached = await this.customerResolver.getCachedCustomerId(userId);
        if (cached) return cached;
      } catch (err) {
        logger.warn('Customer cache lookup failed', {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    try {
      const existing = await this.customerResolver.lookupCustomer(email);
      if (existing) return existing;
    } catch (err) {
      logger.warn('Customer lookup failed — will create new', {
        email,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const created = await this.customerResolver.createCustomer({
      email,
      metadata: userId ? { user_id: userId } : {},
    });
    logger.info('Customer created for checkout', { customerId: created, userId });
    return created;
  }
}
