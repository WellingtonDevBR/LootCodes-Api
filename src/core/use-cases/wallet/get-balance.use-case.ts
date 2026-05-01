import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWalletRepository } from '../../ports/wallet-repository.port.js';
import type { WalletBalance } from './wallet.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-balance');

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject(TOKENS.WalletRepository) private walletRepo: IWalletRepository,
  ) {}

  async execute(userId: string): Promise<WalletBalance> {
    logger.info('Fetching wallet balance', { userId });
    return this.walletRepo.getBalance(userId);
  }
}
