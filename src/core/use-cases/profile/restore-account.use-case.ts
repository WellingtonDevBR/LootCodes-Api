import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('restore-account');

@injectable()
export class RestoreAccountUseCase {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const isDeleted = await this.userProfileRepo.checkDeleted(userId);
    if (!isDeleted) {
      throw new ValidationError('Account is not deleted');
    }
    logger.info('Restoring account', { userId });
    await this.userProfileRepo.restoreProfile(userId);
  }
}
