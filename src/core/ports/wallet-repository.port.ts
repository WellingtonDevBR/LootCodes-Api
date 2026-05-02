import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from '../use-cases/wallet/wallet.types.js';

export interface IWalletRepository {
  getBalance(userId: string): Promise<WalletBalance>;
  listLedger(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }>;
  getOrderEarnings(userId: string, orderIds: string[]): Promise<OrderEarnings[]>;
  claimReviewReward(userId: string, reviewId: string): Promise<{ credited: boolean; amount_cents: number }>;
  getPurchaseRewardConfig(): Promise<unknown>;
  getVariantEarnBonuses(variantIds: string[]): Promise<unknown>;
}
