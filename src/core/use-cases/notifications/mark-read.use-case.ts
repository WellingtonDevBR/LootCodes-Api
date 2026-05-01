import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationRepository } from '../../ports/notification-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';

@injectable()
export class MarkReadUseCase {
  constructor(
    @inject(TOKENS.NotificationRepository) private notificationRepo: INotificationRepository,
  ) {}

  async execute(_userId: string, notificationId: string): Promise<void> {
    if (!notificationId) {
      throw new ValidationError('notificationId is required');
    }
    await this.notificationRepo.markRead(notificationId);
  }
}
