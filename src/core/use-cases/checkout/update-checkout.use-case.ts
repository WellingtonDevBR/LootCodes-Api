import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { ICartValidator } from '../../ports/cart-validator.port.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { IPaymentProviderFactory, PaymentProviderName } from '../../ports/payment-provider-factory.port.js';
import type { CheckoutUpdateDto, CheckoutResult } from './checkout.types.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-checkout-use-case');

function normalizePaymentProviderName(raw?: string): PaymentProviderName {
  const n = raw?.trim().toLowerCase();
  return n === 'paypal' ? 'paypal' : 'stripe';
}

@injectable()
export class UpdateCheckoutUseCase {
  constructor(
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.CartValidator) private cartValidator: ICartValidator,
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
    @inject(TOKENS.PaymentProviderFactory) private providerFactory: IPaymentProviderFactory,
  ) {}

  async execute(dto: CheckoutUpdateDto, userId?: string): Promise<CheckoutResult> {
    const existingOrder = await this.checkoutRepo.getOrder(dto.order_id);
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    if (userId && existingOrder.user_id && existingOrder.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    if (!dto.items?.length) {
      throw new ValidationError('Cart items are required to update checkout');
    }

    for (const item of dto.items) {
      if (!item.product_id?.trim()) {
        throw new ValidationError('Each cart item must include product_id');
      }
    }

    await this.cartValidator.validateItems(dto.items);
    const stockResults = await this.cartValidator.checkStock(dto.items);
    const outOfStock = stockResults.filter((s) => !s.available);
    if (outOfStock.length > 0) {
      throw new ValidationError('Some items are out of stock');
    }

    const subtotalCents = dto.items.reduce((sum, item) => {
      const unit = typeof item.price_usd === 'number' ? item.price_usd : 0;
      return sum + unit * item.quantity;
    }, 0);
    if (subtotalCents <= 0) {
      throw new ValidationError('Invalid cart subtotal');
    }

    const existingCurrency = typeof existingOrder.currency === 'string' ? existingOrder.currency : 'usd';
    const currencyStripe = (dto.currency ?? existingCurrency).trim().toLowerCase();
    const currencyOrder = currencyStripe.toUpperCase();

    let discountAmountCents = 0;
    let promoCodeId: string | null = null;
    let appliedPromoCode: string | null = null;

    if (dto.promo_code?.trim()) {
      if (!userId && !(dto.customer_email?.trim())) {
        throw new ValidationError('Email is required to apply a promo code');
      }
      const promoResult = await this.promoValidator.validate(dto.promo_code.trim(), dto.items, {
        userId,
        guestEmail: dto.customer_email,
        checkoutCurrency: currencyOrder,
      });
      if (promoResult.valid) {
        discountAmountCents = promoResult.discount_cents;
        promoCodeId = promoResult.promo_code_id ?? null;
        appliedPromoCode = dto.promo_code.trim().toUpperCase();
      }
    }

    const chargedCents = Math.max(subtotalCents - discountAmountCents, 1);
    const providerName = normalizePaymentProviderName(dto.payment_provider);

    if (!this.providerFactory.isProviderAvailable(providerName)) {
      throw new ValidationError(`Payment provider "${providerName}" is not available`);
    }

    await this.checkoutRepo.replaceOrderItems(dto.order_id, dto.items);

    // Cancel the old payment intent/order from the previous provider
    const oldPid =
      typeof existingOrder.provider_payment_id === 'string' ? existingOrder.provider_payment_id : null;
    if (oldPid) {
      const oldProviderName = normalizePaymentProviderName(
        typeof existingOrder.payment_provider === 'string' ? existingOrder.payment_provider : undefined,
      );
      const oldProvider = this.providerFactory.getProvider(oldProviderName);
      await oldProvider.cancelPayment(oldPid).catch(() => undefined);
    }

    const provider = this.providerFactory.getProvider(providerName);
    const pi = await provider.createPaymentIntent({
      amount_cents: chargedCents,
      currency: currencyStripe,
      metadata: {
        order_id: dto.order_id,
        order_number: typeof existingOrder.order_number === 'string' ? existingOrder.order_number : '',
        session_id: dto.session_id ?? (typeof existingOrder.session_id === 'string' ? existingOrder.session_id : ''),
        user_id: userId ?? '',
      },
    });

    await this.checkoutRepo.updateOrder(dto.order_id, {
      subtotal_cents: subtotalCents,
      discount_amount_cents: discountAmountCents,
      total_amount: chargedCents,
      currency: currencyOrder,
      promo_code_id: promoCodeId,
      provider_payment_id: pi.id,
      payment_provider: providerName,
    });

    logger.info('Checkout updated', { orderId: dto.order_id, totalCents: chargedCents });

    return {
      success: true,
      order_id: dto.order_id,
      order_number: typeof existingOrder.order_number === 'string' ? existingOrder.order_number : '',
      client_secret: pi.client_secret,
      total_cents: chargedCents,
      currency: currencyStripe,
      payment_provider: providerName,
      promo_code: appliedPromoCode,
      discount_amount_cents: discountAmountCents,
      wallet_redeem_cents: typeof dto.wallet_redeem_cents === 'number' ? dto.wallet_redeem_cents : 0,
    };
  }
}
