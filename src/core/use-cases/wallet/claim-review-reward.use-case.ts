import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWalletRepository } from '../../ports/wallet-repository.port.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('claim-review-reward');

@injectable()
export class ClaimReviewRewardUseCase {
  constructor(
    @inject(TOKENS.WalletRepository) private walletRepo: IWalletRepository,
  ) {}

  async execute(userId: string, reviewId: string): Promise<{ credited: boolean; amount_cents: number }> {
    logger.info('Claiming review reward', { userId, reviewId });
    return this.walletRepo.claimReviewReward(userId, reviewId);
  }
}
