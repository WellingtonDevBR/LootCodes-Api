import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { OrderItemForTicket } from './order.types.js';

@injectable()
export class GetOrderItemsForTicketUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, _userId?: string): Promise<OrderItemForTicket[]> {
    return this.orderRepo.getOrderItemsForTicket(orderId);
  }
}
