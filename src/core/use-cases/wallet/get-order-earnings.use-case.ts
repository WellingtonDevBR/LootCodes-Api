import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWalletRepository } from '../../ports/wallet-repository.port.js';
import type { OrderEarnings } from './wallet.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-order-earnings');

@injectable()
export class GetOrderEarningsUseCase {
  constructor(
    @inject(TOKENS.WalletRepository) private walletRepo: IWalletRepository,
  ) {}

  async execute(userId: string, orderIds: string[]): Promise<OrderEarnings[]> {
    if (orderIds.length === 0) {
      throw new ValidationError('order_ids must not be empty');
    }
    if (orderIds.length > 200) {
      throw new ValidationError('order_ids must contain at most 200 items');
    }
    if (orderIds.some(id => !id || id.trim().length === 0)) {
      throw new ValidationError('order_ids must not contain empty strings');
    }

    logger.info('Fetching order earnings', { userId, orderCount: orderIds.length });
    return this.walletRepo.getOrderEarnings(userId, orderIds);
  }
}
