import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationRepository } from '../../ports/notification-repository.port.js';
import type { INotificationPreferencesRepository } from '../../ports/notification-preferences-repository.port.js';
import type { IPushTokenRepository } from '../../ports/push-token-repository.port.js';
import type { INotificationService } from '../../ports/notification-service.port.js';
import type { Notification, NotificationPreferences, UpdatePreferencesDto } from './notification.types.js';
import { NotFoundError, ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('notification-service');

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TOKENS.NotificationRepository) private notificationRepo: INotificationRepository,
    @inject(TOKENS.NotificationPreferencesRepository) private prefsRepo: INotificationPreferencesRepository,
    @inject(TOKENS.PushTokenRepository) private pushTokenRepo: IPushTokenRepository,
  ) {}

  async listNotifications(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    return this.notificationRepo.list(userId, limit ?? 20, offset ?? 0);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.getUnreadCount(userId);
  }

  async markRead(_userId: string, notificationId: string): Promise<void> {
    if (!notificationId) {
      throw new ValidationError('notificationId is required');
    }
    await this.notificationRepo.markRead(notificationId);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllRead(userId);
    logger.info('Marked all notifications read', { userId });
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
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

  async updatePreferences(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences> {
    logger.info('Updating notification preferences', { userId });
    return this.prefsRepo.update(userId, prefs);
  }

  async registerPushToken(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
    if (!token) {
      throw new ValidationError('token is required');
    }

    logger.info('Registering push token', { userId, platform });
    await this.pushTokenRepo.register(userId, token, platform);
  }

  async removePushToken(userId: string, token: string): Promise<void> {
    if (!token) {
      throw new ValidationError('token is required');
    }

    logger.info('Removing push token', { userId });
    await this.pushTokenRepo.remove(userId, token);
  }
}
