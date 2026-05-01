import type { NotificationPreferences, UpdatePreferencesDto } from '../use-cases/notifications/notification.types.js';

export interface INotificationPreferencesRepository {
  get(userId: string): Promise<NotificationPreferences | null>;
  update(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences>;
}
