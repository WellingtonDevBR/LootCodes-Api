import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IStockNotificationRepository } from '../../../ports/stock-notification-repository.port.js';

@injectable()
export class IsSubscribedToStockUseCase {
  constructor(
    @inject(TOKENS.StockNotificationRepository) private stockNotifRepo: IStockNotificationRepository,
  ) {}

  async execute(userId: string, variantId: string): Promise<boolean> {
    return this.stockNotifRepo.isSubscribed(userId, variantId);
  }
}
