import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationRepository } from '../../ports/notification-repository.port.js';
import type { Notification } from './notification.types.js';

@injectable()
export class ListNotificationsUseCase {
  constructor(
    @inject(TOKENS.NotificationRepository) private notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    return this.notificationRepo.list(userId, limit ?? 20, offset ?? 0);
  }
}
