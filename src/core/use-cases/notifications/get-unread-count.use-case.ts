import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationRepository } from '../../ports/notification-repository.port.js';

@injectable()
export class GetUnreadCountUseCase {
  constructor(
    @inject(TOKENS.NotificationRepository) private notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepo.getUnreadCount(userId);
  }
}
