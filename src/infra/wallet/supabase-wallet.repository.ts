import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IWalletRepository } from '../../core/ports/wallet-repository.port.js';
import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from '../../core/use-cases/wallet/wallet.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-wallet-repository');

@injectable()
export class SupabaseWalletRepository implements IWalletRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getBalance(userId: string): Promise<WalletBalance> {
    return this.db.rpc<WalletBalance>('get_wallet_balance', {
      p_user_id: userId,
    });
  }

  async listLedger(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }> {
    const result = await this.db.rpc<{ entries: WalletLedgerEntry[]; next_cursor: string | null }>('list_wallet_ledger', {
      p_user_id: userId,
      p_limit: params?.limit ?? 20,
      p_before: params?.before ?? null,
    });

    return {
      entries: result.entries,
      nextCursor: result.next_cursor,
    };
  }

  async getOrderEarnings(userId: string, orderIds: string[]): Promise<OrderEarnings[]> {
    logger.info('Fetching order earnings from DB', { userId, orderCount: orderIds.length });
    return this.db.rpc<OrderEarnings[]>('get_order_earnings', {
      p_user_id: userId,
      p_order_ids: orderIds,
    });
  }

  async claimReviewReward(userId: string, reviewId: string): Promise<{ credited: boolean; amount_cents: number }> {
    logger.info('Claiming review reward', { userId, reviewId });
    return this.db.rpc<{ credited: boolean; amount_cents: number }>('claim_review_reward', {
      p_user_id: userId,
      p_review_id: reviewId,
    });
  }
}
