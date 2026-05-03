import { injectable } from 'tsyringe';
import type { IPaymentVerifier } from '../../core/ports/payment-verifier.port.js';
import type { VerifyPaymentDto, ProviderPaymentStatus } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';
import { getPayPalClient } from './paypal-client.js';

const logger = createLogger('paypal-payment-verifier');

@injectable()
export class PayPalPaymentVerifierAdapter implements IPaymentVerifier {
  async verifyPayment(dto: VerifyPaymentDto): Promise<ProviderPaymentStatus> {
    try {
      logger.info('Verifying PayPal order status', { paymentId: dto.payment_intent_id });
      const client = getPayPalClient();

      const response = await client.request(`/v2/checkout/orders/${dto.payment_intent_id}`);
      if (!response.ok) {
        logger.error('PayPal order retrieval failed', null, {
          paymentId: dto.payment_intent_id,
          status: String(response.status),
        });
        return { status: 'error', order_id: dto.order_id, message: 'Failed to retrieve PayPal order' };
      }

      const order = await response.json() as Record<string, unknown>;
      const orderStatus = order.status as string | undefined;
      const units = order.purchase_units as Array<Record<string, unknown>> | undefined;
      const payments = units?.[0]?.payments as Record<string, unknown> | undefined;
      const captures = payments?.captures as Array<Record<string, unknown>> | undefined;
      const captureStatus = captures?.[0]?.status as string | undefined;

      const effectiveStatus = captureStatus ?? orderStatus;

      switch (effectiveStatus) {
        case 'COMPLETED':
        case 'PARTIALLY_REFUNDED':
        case 'REFUNDED':
          return { status: 'fulfilled', order_id: dto.order_id };

        case 'PENDING':
          return { status: 'processing', order_id: dto.order_id, message: 'PayPal payment is pending' };

        case 'APPROVED':
        case 'PAYER_ACTION_REQUIRED':
          return { status: 'requires_action', order_id: dto.order_id, message: 'Buyer approval required' };

        case 'DECLINED':
        case 'FAILED':
          return { status: 'error', order_id: dto.order_id, message: 'PayPal payment was declined' };

        case 'VOIDED':
          return { status: 'canceled', order_id: dto.order_id, message: 'PayPal payment was voided' };

        case 'CREATED':
        case 'SAVED':
          return { status: 'requires_action', order_id: dto.order_id, message: 'Payment not yet completed' };

        default:
          logger.warn('Unexpected PayPal order status', { status: effectiveStatus, paymentId: dto.payment_intent_id });
          return { status: 'error', order_id: dto.order_id, message: 'Unexpected PayPal status' };
      }
    } catch (err: unknown) {
      logger.error('PayPal verification failed', err, { paymentId: dto.payment_intent_id });
      return { status: 'error', order_id: dto.order_id, message: 'PayPal verification failed' };
    }
  }
}
