import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationRepository } from '../../ports/notification-repository.port.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('mark-all-read-use-case');

@injectable()
export class MarkAllReadUseCase {
  constructor(
    @inject(TOKENS.NotificationRepository) private notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepo.markAllRead(userId);
    logger.info('Marked all notifications read', { userId });
  }
}
