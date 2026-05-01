import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('unlock-account-use-case');

@injectable()
export class UnlockAccountUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
  ) {}

  async execute(token: string): Promise<{ success: boolean; error?: string }> {
    logger.info('Account unlock attempt', { tokenPrefix: token.slice(0, 8) });
    const result = await this.holdRepo.resolveByToken(token);
    if (result.success) {
      logger.info('Account unlocked successfully', { tokenPrefix: token.slice(0, 8) });
    } else {
      logger.info('Account unlock failed', { tokenPrefix: token.slice(0, 8), error: result.error });
    }
    return result;
  }
}
