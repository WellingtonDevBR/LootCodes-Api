import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWalletRepository } from '../../ports/wallet-repository.port.js';
import type { IWalletService } from '../../ports/wallet-service.port.js';
import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from './wallet.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('wallet-service');

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TOKENS.WalletRepository) private walletRepo: IWalletRepository,
  ) {}

  async getBalance(userId: string): Promise<WalletBalance> {
    logger.info('Fetching wallet balance', { userId });
    return this.walletRepo.getBalance(userId);
  }

  async listLedger(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }> {
    return this.walletRepo.listLedger(userId, params);
  }

  async getOrderEarnings(userId: string, orderIds: string[]): Promise<OrderEarnings[]> {
    if (orderIds.length === 0) {
      throw new ValidationError('order_ids must not be empty');
    }
    if (orderIds.length > 200) {
      throw new ValidationError('order_ids must contain at most 200 items');
    }
    if (orderIds.some(id => !id || id.trim().length === 0)) {
      throw new ValidationError('order_ids must not contain empty strings');
    }

    logger.info('Fetching order earnings', { userId, orderCount: orderIds.length });
    return this.walletRepo.getOrderEarnings(userId, orderIds);
  }
}
