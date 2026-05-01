import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository } from '../../ports/guest-session.port.js';
import type { GetKeysForOrderUseCase } from '../key-delivery/get-keys-for-order.use-case.js';
import type { ProductKey } from '../orders/order.types.js';
import { AuthenticationError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-guest-order-keys-use-case');

@injectable()
export class GetGuestOrderKeysUseCase {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
    @inject(UC_TOKENS.GetKeysForOrder) private getKeysForOrder: GetKeysForOrderUseCase,
  ) {}

  async execute(token: string, orderId: string): Promise<ProductKey[]> {
    const session = await this.guestSessionRepo.validateToken(token);
    if (!session) {
      throw new AuthenticationError('Invalid or expired guest session');
    }
    if (session.order_id !== orderId) {
      logger.warn('Guest order ID mismatch', { expected: session.order_id, received: orderId });
      throw new ForbiddenError('You do not have access to this order');
    }

    logger.info('Guest accessing order keys', { orderId, email: session.email });
    return this.getKeysForOrder.execute(orderId, session.email);
  }
}
