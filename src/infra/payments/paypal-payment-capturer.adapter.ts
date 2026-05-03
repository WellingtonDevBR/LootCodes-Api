import { injectable } from 'tsyringe';
import type { IPaymentCapturer } from '../../core/ports/payment-capturer.port.js';
import type { CapturePaymentDto, CaptureResult } from '../../core/use-cases/payments/payment.types.js';
import { PaymentError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';
import { getPayPalClient, PayPalApiError } from './paypal-client.js';

const logger = createLogger('paypal-payment-capturer');

function payPalErrorHasIssue(body: string, issueCode: string): boolean {
  try {
    const parsed = JSON.parse(body);
    const details = Array.isArray(parsed?.details) ? parsed.details : [];
    return details.some((d: Record<string, unknown>) => d?.issue === issueCode);
  } catch {
    return false;
  }
}

@injectable()
export class PayPalPaymentCapturerAdapter implements IPaymentCapturer {
  async capture(dto: CapturePaymentDto): Promise<CaptureResult> {
    const client = getPayPalClient();
    const paymentId = dto.payment_intent_id;

    const response = await client.request(`/v2/checkout/orders/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        'PayPal-Request-Id': client.idempotencyKey(['capture', paymentId]),
      },
      body: '{}',
    });

    if (response.ok) {
      const order = await response.json() as Record<string, unknown>;
      const capture = this.extractCapture(order);
      logger.info('PayPal payment captured', { paymentId, orderId: dto.order_id });
      return {
        captured: true,
        payment_intent_id: paymentId,
        amount_cents: capture.amountCents,
        currency: capture.currency,
      };
    }

    const body = await response.text().catch(() => '');
    if (response.status === 422 && payPalErrorHasIssue(body, 'ORDER_ALREADY_CAPTURED')) {
      logger.info('PayPal order already captured', { paymentId });
      const existing = await this.retrieveOrderForCapture(paymentId);
      return {
        captured: true,
        payment_intent_id: paymentId,
        amount_cents: existing.amountCents,
        currency: existing.currency,
      };
    }

    const err = new PayPalApiError('capture', response.status, response.headers.get('paypal-debug-id'), body);
    logger.error('PayPal capture failed', err, { paymentId, orderId: dto.order_id });
    throw new PaymentError(err.message);
  }

  private extractCapture(order: Record<string, unknown>): { amountCents: number; currency: string } {
    const units = order.purchase_units as Array<Record<string, unknown>> | undefined;
    const capture = (units?.[0]?.payments as Record<string, unknown>)?.captures;
    const first = Array.isArray(capture) ? (capture[0] as Record<string, unknown>) : undefined;
    const amount = first?.amount as Record<string, string> | undefined;
    const currency = (amount?.currency_code ?? 'USD').toUpperCase();
    const value = parseFloat(amount?.value ?? '0');
    return { amountCents: Math.round(value * 100), currency };
  }

  private async retrieveOrderForCapture(paymentId: string): Promise<{ amountCents: number; currency: string }> {
    const client = getPayPalClient();
    const response = await client.request(`/v2/checkout/orders/${paymentId}`);
    if (!response.ok) {
      throw new PaymentError(`Failed to retrieve PayPal order ${paymentId} after capture`);
    }
    const order = await response.json() as Record<string, unknown>;
    return this.extractCapture(order);
  }
}
