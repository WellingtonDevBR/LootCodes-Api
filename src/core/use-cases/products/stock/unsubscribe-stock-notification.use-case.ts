import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IStockNotificationRepository } from '../../../ports/stock-notification-repository.port.js';
import { createLogger } from '../../../../shared/logger.js';

const logger = createLogger('unsubscribe-stock-notification');

@injectable()
export class UnsubscribeStockNotificationUseCase {
  constructor(
    @inject(TOKENS.StockNotificationRepository) private stockNotifRepo: IStockNotificationRepository,
  ) {}

  async execute(userId: string, variantId: string): Promise<void> {
    logger.info('Stock notification unsubscribe', { userId, variantId });
    await this.stockNotifRepo.unsubscribe(userId, variantId);
  }
}
