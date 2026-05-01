import { injectable } from 'tsyringe';
import type { IPaymentGateway, PaymentStatus } from '../../core/ports/payment-gateway.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

// TODO: Replace with real Stripe integration when checkout domain is fully wired
@injectable()
export class StripePaymentGatewayAdapter implements IPaymentGateway {
  async verifyPayment(_paymentIntentId: string): Promise<PaymentStatus> {
    throw new InternalError('Payment gateway not configured');
  }

  async getPaymentStatus(_orderId: string): Promise<PaymentStatus> {
    throw new InternalError('Payment gateway not configured');
  }
}
