import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('claim-guest-order-use-case');

@injectable()
export class ClaimGuestOrderUseCase {
  constructor(
    @inject(TOKENS.OrderAccessTokenRepository) private tokenRepo: IOrderAccessTokenRepository,
  ) {}

  async execute(token: string, userId: string): Promise<void> {
    logger.info('Claiming guest order', { userId });
    await this.tokenRepo.claimToUser(token, userId);
  }
}
