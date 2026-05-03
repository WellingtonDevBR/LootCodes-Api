import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { OrderForVerification } from './order.types.js';

@injectable()
export class GetOrderForVerificationUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    _auth?: { userId?: string; orderAccessToken?: string },
  ): Promise<OrderForVerification | null> {
    return this.orderRepo.findForVerification(orderId);
  }
}
