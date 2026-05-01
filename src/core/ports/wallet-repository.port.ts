import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from '../services/wallet/wallet.types.js';

export interface IWalletRepository {
  getBalance(userId: string): Promise<WalletBalance>;
  listLedger(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }>;
  getOrderEarnings(userId: string, orderIds: string[]): Promise<OrderEarnings[]>;
}
