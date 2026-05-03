import { injectable } from 'tsyringe';
import type {
  IPaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntent,
} from '../../core/ports/payment-provider.port.js';
import { PaymentError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';
import { getPayPalClient } from './paypal-client.js';

const logger = createLogger('paypal-payment-provider');

function mapOrderToPaymentIntent(order: Record<string, unknown>): PaymentIntent {
  const purchaseUnits = order.purchase_units as Array<Record<string, unknown>> | undefined;
  const firstUnit = purchaseUnits?.[0];
  const amountObj = firstUnit?.amount as Record<string, string> | undefined;
  const currency = (amountObj?.currency_code ?? 'USD').toUpperCase();
  const value = parseFloat(amountObj?.value ?? '0');
  const amountCents = Math.round(value * 100);
  const status = mapPayPalStatus(order.status as string | undefined);

  return {
    id: String(order.id ?? ''),
    client_secret: String(order.id ?? ''),
    status,
    amount_cents: amountCents,
    currency,
    card_last4: null,
  };
}

function mapPayPalStatus(status?: string): string {
  switch (status) {
    case 'COMPLETED': return 'succeeded';
    case 'APPROVED': return 'requires_action';
    case 'CREATED': return 'requires_payment_method';
    case 'SAVED': return 'processing';
    case 'PAYER_ACTION_REQUIRED': return 'requires_action';
    case 'VOIDED': return 'canceled';
    default: return status?.toLowerCase() ?? 'unknown';
  }
}

@injectable()
export class PayPalPaymentAdapter implements IPaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    const client = getPayPalClient();
    const currency = params.currency.toUpperCase();
    const totalValue = (params.amount_cents / 100).toFixed(2);

    const orderBody = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.metadata?.order_id ?? undefined,
          custom_id: params.metadata?.order_id ?? undefined,
          amount: {
            currency_code: currency,
            value: totalValue,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
          },
        },
        card: {
          attributes: {
            verification: { method: 'SCA_ALWAYS' },
          },
        },
      },
    };

    const response = await client.request('/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'PayPal-Request-Id': client.idempotencyKey([
          'create',
          params.metadata?.order_id,
          params.amount_cents,
          currency,
        ]),
      },
      body: JSON.stringify(orderBody),
    });

    if (!response.ok) {
      throw await client.toApiError(response, 'createOrder');
    }

    const json = await response.json() as Record<string, unknown>;
    logger.info('PayPal order created', {
      orderId: String(json.id),
      amountCents: params.amount_cents,
      currency,
    });

    return {
      id: String(json.id),
      client_secret: String(json.id),
      status: 'requires_payment_method',
      amount_cents: params.amount_cents,
      currency,
      card_last4: null,
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentIntent> {
    return this.getPaymentIntent(paymentId);
  }

  async cancelPayment(_paymentId: string): Promise<void> {
    // PayPal orders expire automatically after 3 hours if not approved/captured.
  }

  async getPaymentIntent(paymentId: string): Promise<PaymentIntent> {
    const client = getPayPalClient();

    const response = await client.request(`/v2/checkout/orders/${paymentId}`);
    if (!response.ok) {
      const err = await client.toApiError(response, 'retrieveOrder');
      logger.error('PayPal retrieve order failed', err, { paymentId });
      throw new PaymentError(err.message);
    }

    const json = await response.json() as Record<string, unknown>;
    return mapOrderToPaymentIntent(json);
  }
}
