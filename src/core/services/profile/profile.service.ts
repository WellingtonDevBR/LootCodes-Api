import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import type { IAvatarStorage } from '../../ports/avatar-storage.port.js';
import type { ISessionRepository } from '../../ports/session-repository.port.js';
import type { IAuthProvider } from '../../ports/auth.port.js';
import type { IProfileService } from '../../ports/profile-service.port.js';
import type {
  UserProfile,
  UpsertProfileDto,
  ChangeEmailDto,
  ChangePasswordDto,
  UserSession,
  UpsertSessionDto,
} from './profile.types.js';
import { NotFoundError, ValidationError } from '../../errors/domain-errors.js';
import { validateEmail, validateName, validateCountryCode } from '../../../shared/input-validation.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('profile-service');

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
    @inject(TOKENS.AvatarStorage) private avatarStorage: IAvatarStorage,
    @inject(TOKENS.SessionRepository) private sessionRepo: ISessionRepository,
    @inject(TOKENS.AuthProvider) private auth: IAuthProvider,
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepo.getProfile(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile> {
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

  async deleteAccount(userId: string): Promise<void> {
    logger.info('Deleting account', { userId });
    await this.userProfileRepo.deleteProfile(userId);
  }

  async changeEmail(userId: string, dto: ChangeEmailDto): Promise<void> {
    const emailResult = validateEmail(dto.new_email);
    if (!emailResult.isValid) throw new ValidationError(emailResult.error!);

    logger.info('Changing email', { userId });
    await this.auth.updateUser(userId, { email: emailResult.sanitized });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (!dto.new_password || dto.new_password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    logger.info('Changing password', { userId });
    await this.auth.updateUser(userId, { password: dto.new_password });
  }

  async getRole(userId: string): Promise<string> {
    const role = await this.userProfileRepo.getRole(userId);
    return role ?? 'user';
  }

  async upsertSession(dto: UpsertSessionDto): Promise<UserSession> {
    return this.sessionRepo.upsert(dto);
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepo.getActiveSessions(userId);
  }

  async terminateSession(sessionId: string): Promise<void> {
    await this.sessionRepo.terminate(sessionId);
  }
}
