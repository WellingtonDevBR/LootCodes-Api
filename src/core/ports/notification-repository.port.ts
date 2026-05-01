import type { Notification } from '../use-cases/notifications/notification.types.js';

export interface INotificationRepository {
  list(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markRead(notificationId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}
