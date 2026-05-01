import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationPreferencesRepository } from '../../ports/notification-preferences-repository.port.js';
import type { NotificationPreferences } from './notification.types.js';

@injectable()
export class GetPreferencesUseCase {
  constructor(
    @inject(TOKENS.NotificationPreferencesRepository) private prefsRepo: INotificationPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<NotificationPreferences> {
    const prefs = await this.prefsRepo.get(userId);
    if (!prefs) {
      return {
        user_id: userId,
        orders: true,
        promotions: true,
        stock_alerts: true,
        support: true,
        security: true,
      };
    }
    return prefs;
  }
}
