import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { IPaymentProvider } from '../../ports/payment-provider.port.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('cancel-checkout-use-case');

@injectable()
export class CancelCheckoutUseCase {
  constructor(
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.PaymentProvider) private paymentProvider: IPaymentProvider,
  ) {}

  async execute(orderId: string, userId?: string): Promise<void> {
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
}
