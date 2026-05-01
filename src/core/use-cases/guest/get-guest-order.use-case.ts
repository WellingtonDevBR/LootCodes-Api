import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository } from '../../ports/guest-session.port.js';
import type { GetOrderDetailUseCase } from '../orders/get-order-detail.use-case.js';
import type { OrderDetail } from '../orders/order.types.js';
import { AuthenticationError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-guest-order-use-case');

@injectable()
export class GetGuestOrderUseCase {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
    @inject(UC_TOKENS.GetOrderDetail) private getOrderDetail: GetOrderDetailUseCase,
  ) {}

  async execute(token: string, orderId: string): Promise<OrderDetail> {
    const session = await this.guestSessionRepo.validateToken(token);
    if (!session) {
      throw new AuthenticationError('Invalid or expired guest session');
    }
    if (session.order_id !== orderId) {
      logger.warn('Guest order ID mismatch', { expected: session.order_id, received: orderId });
      throw new ForbiddenError('You do not have access to this order');
    }

    logger.info('Guest accessing order', { orderId, email: session.email });
    return this.getOrderDetail.execute(orderId, session.email);
  }
}
