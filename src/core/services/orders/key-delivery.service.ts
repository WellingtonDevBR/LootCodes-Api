import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { IPaymentGateway } from '../../ports/payment-gateway.port.js';
import type { IKeyDeliveryService } from '../../ports/key-delivery-service.port.js';
import type { ProductKey } from './order.types.js';
import { NotFoundError, ForbiddenError, InternalError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('key-delivery-service');

@injectable()
export class KeyDeliveryService implements IKeyDeliveryService {
  constructor(
    @inject(TOKENS.ProductKeyRepository) private keyRepo: IProductKeyRepository,
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
    @inject(TOKENS.PaymentGateway) private paymentGateway: IPaymentGateway,
  ) {}

  async getKeysForOrder(orderId: string, userId: string): Promise<ProductKey[]> {
    await this.verifyOrderOwnership(orderId, userId);
    return this.keyRepo.getKeysForOrder(orderId, userId);
  }

  async getKeysForOrderItem(orderItemId: string, _userId: string): Promise<ProductKey[]> {
    return this.keyRepo.getKeysForOrderItem(orderItemId);
  }

  async revealKey(
    keyId: string,
    orderId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const order = await this.verifyOrderOwnership(orderId, userId);

    if (!order.payment_intent_id) {
      throw new InternalError('Order has no associated payment');
    }

    const paymentStatus = await this.paymentGateway.verifyPayment(order.payment_intent_id);
    if (!paymentStatus.paid) {
      logger.warn('Key reveal blocked — payment not confirmed', { keyId, orderId, userId });
      throw new ForbiddenError('Payment has not been confirmed');
    }

    const decrypted = await this.keyRepo.decryptKey(keyId);

    await this.keyRepo.logKeyView({
      key_id: keyId,
      order_id: orderId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    logger.info('Key revealed', { keyId, orderId, userId });
    return decrypted;
  }

  async checkKeyViewed(keyId: string, orderId: string, userId: string): Promise<boolean> {
    return this.keyRepo.checkKeyViewed(keyId, orderId, userId);
  }

  private async verifyOrderOwnership(orderId: string, userId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }
    return order;
  }
}
