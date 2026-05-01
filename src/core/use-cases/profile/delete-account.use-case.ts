import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('delete-account');

@injectable()
export class DeleteAccountUseCase {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    logger.info('Deleting account', { userId });
    await this.userProfileRepo.deleteProfile(userId);
  }
}
