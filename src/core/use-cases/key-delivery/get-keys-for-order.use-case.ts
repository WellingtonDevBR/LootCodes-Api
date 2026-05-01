import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { ProductKey } from '../orders/order.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';

@injectable()
export class GetKeysForOrderUseCase {
  constructor(
    @inject(TOKENS.ProductKeyRepository) private keyRepo: IProductKeyRepository,
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<ProductKey[]> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    return this.keyRepo.getKeysForOrder(orderId, userId);
  }
}
