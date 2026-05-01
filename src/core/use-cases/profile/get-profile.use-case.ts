import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import type { UserProfile } from './profile.types.js';
import { NotFoundError } from '../../errors/domain-errors.js';

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepo.getProfile(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }
    return profile;
  }
}
