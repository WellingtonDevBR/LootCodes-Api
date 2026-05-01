import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IStockNotificationRepository } from '../../../ports/stock-notification-repository.port.js';
import { createLogger } from '../../../../shared/logger.js';

const logger = createLogger('subscribe-stock-notification');

@injectable()
export class SubscribeStockNotificationUseCase {
  constructor(
    @inject(TOKENS.StockNotificationRepository) private stockNotifRepo: IStockNotificationRepository,
  ) {}

  async execute(userId: string, variantId: string, email: string): Promise<void> {
    logger.info('Stock notification subscribe', { userId, variantId });
    await this.stockNotifRepo.subscribe(userId, variantId, email);
  }
}
