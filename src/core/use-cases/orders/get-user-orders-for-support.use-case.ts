import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { Order } from './order.types.js';

@injectable()
export class GetUserOrdersForSupportUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserForSupport(userId);
  }
}
