import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { INotificationPreferencesRepository } from '../../core/ports/notification-preferences-repository.port.js';
import type { NotificationPreferences, UpdatePreferencesDto } from '../../core/use-cases/notifications/notification.types.js';

@injectable()
export class SupabaseNotificationPreferencesRepository implements INotificationPreferencesRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async get(userId: string): Promise<NotificationPreferences | null> {
    return this.db.queryOne<NotificationPreferences>('notification_preferences', {
      eq: [['user_id', userId]],
    });
  }

  async update(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences> {
    return this.db.upsert<NotificationPreferences>(
      'notification_preferences',
      { user_id: userId, ...prefs },
      'user_id',
    );
  }
}
