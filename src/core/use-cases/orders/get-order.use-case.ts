import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { Order } from './order.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-order-use-case');

@injectable()
export class GetOrderUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user_id !== userId) {
      logger.warn('Order access denied — user mismatch', { orderId, userId });
      throw new ForbiddenError('You do not have access to this order');
    }

    return order;
  }
}
