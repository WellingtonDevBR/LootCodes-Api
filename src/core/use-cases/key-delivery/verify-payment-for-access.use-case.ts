import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import { NotFoundError } from '../../errors/domain-errors.js';

export interface VerifyPaymentForAccessDto {
  order_id: string;
  access_token?: string;
  email?: string;
  user_id?: string;
}

export interface VerifyPaymentForAccessResult {
  verified: boolean;
  order_id: string;
  message?: string;
}

@injectable()
export class VerifyPaymentForAccessUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(dto: VerifyPaymentForAccessDto): Promise<VerifyPaymentForAccessResult> {
    const order = await this.orderRepo.findById(dto.order_id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'completed' && order.status !== 'fulfilled') {
      return {
        verified: false,
        order_id: dto.order_id,
        message: 'Order payment not completed',
      };
    }

    return {
      verified: true,
      order_id: dto.order_id,
    };
  }
}
