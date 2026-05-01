import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IStockNotificationRepository } from '../../core/ports/stock-notification-repository.port.js';

@injectable()
export class SupabaseStockNotificationRepository implements IStockNotificationRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async subscribe(userId: string, variantId: string, email: string): Promise<void> {
    await this.db.upsert('stock_notifications', {
      user_id: userId,
      variant_id: variantId,
      email,
    }, 'user_id,variant_id');
  }

  async unsubscribe(userId: string, variantId: string): Promise<void> {
    await this.db.delete('stock_notifications', {
      user_id: userId,
      variant_id: variantId,
    });
  }

  async isSubscribed(userId: string, variantId: string): Promise<boolean> {
    const row = await this.db.queryOne('stock_notifications', {
      eq: [['user_id', userId], ['variant_id', variantId]],
    });
    return row !== null;
  }
}
