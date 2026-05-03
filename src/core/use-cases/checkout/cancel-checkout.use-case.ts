import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { IPaymentProviderFactory, PaymentProviderName } from '../../ports/payment-provider-factory.port.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('cancel-checkout-use-case');

@injectable()
export class CancelCheckoutUseCase {
  constructor(
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
    @inject(TOKENS.PaymentProviderFactory) private providerFactory: IPaymentProviderFactory,
  ) {}

  async execute(orderId: string, userId?: string): Promise<void> {
    const existingOrder = await this.checkoutRepo.getOrder(orderId);
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    if (userId && existingOrder.user_id && existingOrder.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    const pid = existingOrder.provider_payment_id;
    if (typeof pid === 'string' && pid.length > 0) {
      const providerName: PaymentProviderName =
        typeof existingOrder.payment_provider === 'string' && existingOrder.payment_provider.toLowerCase() === 'paypal'
          ? 'paypal'
          : 'stripe';
      const provider = this.providerFactory.getProvider(providerName);
      await provider.cancelPayment(pid);
    }

    await this.checkoutRepo.cancelOrder(orderId);
    logger.info('Checkout cancelled', { orderId });
  }
}
