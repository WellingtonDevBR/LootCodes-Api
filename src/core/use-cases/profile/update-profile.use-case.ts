import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import type { UserProfile, UpsertProfileDto } from './profile.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { validateName, validateCountryCode } from '../../../shared/input-validation.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-profile');

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(userId: string, data: UpsertProfileDto): Promise<UserProfile> {
    if (data.full_name !== undefined) {
      const nameResult = validateName(data.full_name, { required: false, minLength: 2, maxLength: 50 });
      if (!nameResult.isValid) throw new ValidationError(nameResult.error!);
      data.full_name = nameResult.sanitized;
    }

    if (data.country !== undefined) {
      const countryResult = validateCountryCode(data.country, { required: false });
      if (!countryResult.isValid) throw new ValidationError(countryResult.error!);
      data.country = countryResult.sanitized;
    }

    logger.info('Updating profile', { userId });
    return this.userProfileRepo.upsertProfile(userId, data);
  }
}
