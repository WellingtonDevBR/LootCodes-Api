import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAuthProvider } from '../../ports/auth.port.js';
import type { ChangePasswordDto } from './profile.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('change-password');

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject(TOKENS.AuthProvider) private auth: IAuthProvider,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (!dto.new_password || dto.new_password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    logger.info('Changing password', { userId });
    await this.auth.updateUser(userId, { password: dto.new_password });
  }
}
