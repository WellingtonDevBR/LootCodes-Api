import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type {
  BillingAddressPayload,
  CartItem,
} from '../../core/use-cases/checkout/checkout.types.js';
import type { ICheckoutRepository, CreateOrderParams } from '../../core/ports/checkout-repository.port.js';
import type {
  PaymentMethodsConfig,
  PayPalMethodsConfig,
  StripeMethodsConfig,
} from '../../core/use-cases/checkout/checkout.types.js';
import { ValidationError } from '../../core/errors/domain-errors.js';
import { inetColumnOrNull } from '../../shared/client-ip.js';

function mapBilling(payload: BillingAddressPayload | null | undefined): {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal: string | null;
  country: string | null;
} {
  if (!payload) {
    return { line1: null, line2: null, city: null, state: null, postal: null, country: null };
  }
  const street = payload as Record<string, string | undefined>;
  const line1 = street.street_address_1 ?? street.line1 ?? null;
  const line2 = street.street_address_2 ?? street.line2 ?? null;
  const city = street.city ?? null;
  const state = street.state_province ?? street.state ?? null;
  const postal = street.postal_code ?? null;
  const countryRaw = street.country_code ?? street.country ?? null;
  const trimmed = countryRaw?.trim() ?? '';
  let country: string | null = null;
  if (trimmed.length === 2) country = trimmed.toUpperCase();

  return { line1, line2, city, state, postal, country };
}

function normalizePaymentMethodsConfig(raw: PaymentMethodsConfig | Record<string, unknown>): PaymentMethodsConfig {
  const r = raw as Record<string, Record<string, boolean | unknown>>;
  const stripeIn = r.stripe ?? {};
  const paypalIn = r.paypal ?? {};
  /** Accept legacy storefront shape `{ card, google_pay, apple_pay }` when present in DB snapshots. */
  const stripeLegacy = stripeIn as Record<string, boolean | unknown>;
  const stripe: StripeMethodsConfig = {
    card_enabled:
      typeof stripeLegacy.card_enabled === 'boolean'
        ? stripeLegacy.card_enabled
        : stripeLegacy.card === true,
    apple_pay_enabled:
      typeof stripeLegacy.apple_pay_enabled === 'boolean'
        ? stripeLegacy.apple_pay_enabled
        : stripeLegacy.apple_pay === true,
    google_pay_enabled:
      typeof stripeLegacy.google_pay_enabled === 'boolean'
        ? stripeLegacy.google_pay_enabled
        : stripeLegacy.google_pay === true,
  };

  const paypal: PayPalMethodsConfig =
    paypalIn.smart_buttons_enabled !== undefined
      ? {
          smart_buttons_enabled: Boolean(paypalIn.smart_buttons_enabled),
          pay_later_enabled: Boolean(paypalIn.pay_later_enabled),
          credit_enabled: Boolean(paypalIn.credit_enabled),
          card_fields_enabled: Boolean(paypalIn.card_fields_enabled),
        }
      : {
          smart_buttons_enabled: paypalIn.enabled !== false,
          pay_later_enabled: paypalIn.enabled !== false,
          credit_enabled: paypalIn.enabled !== false,
          card_fields_enabled: false,
        };

  return { stripe, paypal };
}

@injectable()
export class SupabaseCheckoutRepository implements ICheckoutRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async createOrder(params: CreateOrderParams): Promise<{ id: string; order_number: string | null }> {
    for (const item of params.items) {
      const pid = item.product_id?.trim();
      if (!pid) throw new ValidationError('Each cart item must include product_id');
    }

    const currencyCode = params.currency.trim().toUpperCase();
    const billing = mapBilling(params.billing_address ?? null);
    const contactEmail =
      typeof params.customer_email === 'string' ? params.customer_email.trim().toLowerCase() : null;
    const guestEmail = params.user_id ? null : contactEmail;
    const deliveryEmail = params.user_id ? contactEmail : null;

    const orderInsert: Record<string, unknown> = {
      user_id: params.user_id ?? null,
      session_id: params.session_id ?? null,
      guest_email: guestEmail,
      delivery_email: deliveryEmail,
      contact_email: contactEmail,
      customer_full_name: typeof params.customer_name === 'string' ? params.customer_name.trim() || null : null,
      billing_street_address_1: billing.line1,
      billing_street_address_2: billing.line2,
      billing_city: billing.city,
      billing_state_province: billing.state,
      billing_postal_code: billing.postal,
      billing_country_code: billing.country,
      status: 'pending',
      fulfillment_status: 'pending',
      subtotal_cents: params.subtotal_cents,
      discount_amount_cents: params.discount_amount_cents,
      total_amount: params.total_amount_cents,
      currency: currencyCode,
      payment_provider: params.payment_provider,
      promo_code_id: params.promo_code_id ?? null,
      provider_payment_id: null,
      ip_address: inetColumnOrNull(params.ip_address ?? undefined),
    };

    const orderRow = await this.db.insert<{ id: string; order_number: string | null }>('orders', orderInsert);

    await this.insertOrderItems(orderRow.id, params.items);

    return { id: orderRow.id, order_number: orderRow.order_number };
  }

  private async insertOrderItems(orderId: string, items: CartItem[]): Promise<void> {
    for (const item of items) {
      const productId = item.product_id?.trim();
      if (!productId) {
        throw new ValidationError('Each cart item must include product_id');
      }
      const unitPrice = typeof item.price_usd === 'number' ? item.price_usd : 0;
      await this.db.insert('order_items', {
        order_id: orderId,
        product_id: productId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        status: 'pending',
      });
    }
  }

  async replaceOrderItems(orderId: string, items: CartItem[]): Promise<void> {
    for (const item of items) {
      const pid = item.product_id?.trim();
      if (!pid) throw new ValidationError('Each cart item must include product_id');
    }

    await this.db.delete('order_items', { order_id: orderId });
    await this.insertOrderItems(orderId, items);
  }

  async updateOrder(orderId: string, data: Record<string, unknown>): Promise<void> {
    await this.db.update('orders', { id: orderId }, data);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.db.update('orders', { id: orderId }, { status: 'cancelled' });
  }

  async getOrder(orderId: string): Promise<Record<string, unknown> | null> {
    return this.db.queryOne<Record<string, unknown>>('orders', {
      eq: [['id', orderId]],
    });
  }

  async getPaymentMethodsConfig(): Promise<PaymentMethodsConfig> {
    const row = await this.db.queryOne<{ value: PaymentMethodsConfig }>('platform_settings', {
      eq: [['key', 'payment_methods']],
      select: 'value',
    });
    const fallback: PaymentMethodsConfig = {
      stripe: { card_enabled: true, apple_pay_enabled: true, google_pay_enabled: true },
      paypal: {
        smart_buttons_enabled: true,
        pay_later_enabled: true,
        credit_enabled: true,
        card_fields_enabled: false,
      },
    };

    const rawValue = row?.value as PaymentMethodsConfig | undefined;
    if (!rawValue) return fallback;

    try {
      return normalizePaymentMethodsConfig(rawValue);
    } catch {
      return fallback;
    }
  }
}
