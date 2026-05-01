import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { OrderDetail } from './order.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-order-detail-use-case');

@injectable()
export class GetOrderDetailUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<OrderDetail> {
    const detail = await this.orderRepo.getOrderDetail(orderId);
    if (!detail) {
      throw new NotFoundError('Order not found');
    }

    if (detail.order.user_id !== userId) {
      logger.warn('Order detail access denied — user mismatch', { orderId, userId });
      throw new ForbiddenError('You do not have access to this order');
    }

    return detail;
  }
}
