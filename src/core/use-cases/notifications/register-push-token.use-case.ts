import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPushTokenRepository } from '../../ports/push-token-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('register-push-token-use-case');

@injectable()
export class RegisterPushTokenUseCase {
  constructor(
    @inject(TOKENS.PushTokenRepository) private pushTokenRepo: IPushTokenRepository,
  ) {}

  async execute(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
    if (!token) {
      throw new ValidationError('token is required');
    }

    logger.info('Registering push token', { userId, platform });
    await this.pushTokenRepo.register(userId, token, platform);
  }
}
