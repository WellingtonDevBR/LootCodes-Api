import type { Notification, NotificationPreferences, UpdatePreferencesDto } from '../services/notifications/notification.types.js';

export interface INotificationService {
  listNotifications(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markRead(userId: string, notificationId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences>;
  registerPushToken(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void>;
  removePushToken(userId: string, token: string): Promise<void>;
}
