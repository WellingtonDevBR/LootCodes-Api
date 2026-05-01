import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAuthProvider } from '../../ports/auth.port.js';
import type { ChangeEmailDto } from './profile.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { validateEmail } from '../../../shared/input-validation.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('change-email');

@injectable()
export class ChangeEmailUseCase {
  constructor(
    @inject(TOKENS.AuthProvider) private auth: IAuthProvider,
  ) {}

  async execute(userId: string, dto: ChangeEmailDto): Promise<void> {
    const emailResult = validateEmail(dto.new_email);
    if (!emailResult.isValid) throw new ValidationError(emailResult.error!);

    logger.info('Changing email', { userId });
    await this.auth.updateUser(userId, { email: emailResult.sanitized });
  }
}
