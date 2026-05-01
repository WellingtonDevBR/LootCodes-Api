import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { INotificationRepository } from '../../core/ports/notification-repository.port.js';
import type { Notification } from '../../core/services/notifications/notification.types.js';

@injectable()
export class SupabaseNotificationRepository implements INotificationRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async list(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    const rows = await this.db.query<Notification>('notifications_inbox', {
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: limit ?? 20,
    });
    return offset ? rows.slice(offset) : rows;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const rows = await this.db.query<Notification>('notifications_inbox', {
      eq: [['user_id', userId], ['read', false]],
      select: 'id',
    });
    return rows.length;
  }

  async markRead(notificationId: string): Promise<void> {
    await this.db.update('notifications_inbox', { id: notificationId }, { read: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.update('notifications_inbox', { user_id: userId, read: false }, { read: true });
  }
}
