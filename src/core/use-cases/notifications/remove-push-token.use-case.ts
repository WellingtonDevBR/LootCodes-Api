import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPushTokenRepository } from '../../ports/push-token-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('remove-push-token-use-case');

@injectable()
export class RemovePushTokenUseCase {
  constructor(
    @inject(TOKENS.PushTokenRepository) private pushTokenRepo: IPushTokenRepository,
  ) {}

  async execute(userId: string, token: string): Promise<void> {
    if (!token) {
      throw new ValidationError('token is required');
    }

    logger.info('Removing push token', { userId });
    await this.pushTokenRepo.remove(userId, token);
  }
}
