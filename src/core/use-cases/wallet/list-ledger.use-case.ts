import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IWalletRepository } from '../../ports/wallet-repository.port.js';
import type { WalletLedgerEntry, LedgerPaginationParams } from './wallet.types.js';

@injectable()
export class ListLedgerUseCase {
  constructor(
    @inject(TOKENS.WalletRepository) private walletRepo: IWalletRepository,
  ) {}

  async execute(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }> {
    return this.walletRepo.listLedger(userId, params);
  }
}
