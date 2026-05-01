import type { NotificationPreferences, UpdatePreferencesDto } from '../services/notifications/notification.types.js';

export interface INotificationPreferencesRepository {
  get(userId: string): Promise<NotificationPreferences | null>;
  update(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences>;
}
