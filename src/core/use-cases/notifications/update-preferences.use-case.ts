import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INotificationPreferencesRepository } from '../../ports/notification-preferences-repository.port.js';
import type { NotificationPreferences, UpdatePreferencesDto } from './notification.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-preferences-use-case');

@injectable()
export class UpdatePreferencesUseCase {
  constructor(
    @inject(TOKENS.NotificationPreferencesRepository) private prefsRepo: INotificationPreferencesRepository,
  ) {}

  async execute(userId: string, prefs: UpdatePreferencesDto): Promise<NotificationPreferences> {
    logger.info('Updating notification preferences', { userId });
    return this.prefsRepo.update(userId, prefs);
  }
}
