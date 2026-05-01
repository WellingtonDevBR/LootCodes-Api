import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { Order, PaginationParams } from './order.types.js';

@injectable()
export class GetUserOrdersUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId, pagination);
  }
}
