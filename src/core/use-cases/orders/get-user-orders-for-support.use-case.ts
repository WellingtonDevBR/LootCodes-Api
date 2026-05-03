import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { UserOrderForSupport } from './order.types.js';

@injectable()
export class GetUserOrdersForSupportUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(userId: string): Promise<UserOrderForSupport[]> {
    return this.orderRepo.getUserOrdersForSupport(userId);
  }
}
