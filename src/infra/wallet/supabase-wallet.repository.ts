import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IWalletRepository } from '../../core/ports/wallet-repository.port.js';
import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from '../../core/use-cases/wallet/wallet.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-wallet-repository');

const ZERO_BALANCE: WalletBalance = {
  balance_cents: 0,
  lifetime_credited_cents: 0,
  lifetime_redeemed_cents: 0,
  expiring_soon_cents: 0,
  next_expiry: null,
};

@injectable()
export class SupabaseWalletRepository implements IWalletRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const result = await this.db.rpc<WalletBalance | WalletBalance[]>('get_wallet_balance_for_user', {
        p_user_id: userId,
      });
      const row = Array.isArray(result) ? result[0] : result;
      return row ?? ZERO_BALANCE;
    } catch (err) {
      logger.warn('get_wallet_balance_for_user failed, returning zero balance', { userId, error: String(err) });
      return ZERO_BALANCE;
    }
  }

  async listLedger(userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }> {
    const limit = Math.max(1, Math.min(params?.limit ?? 20, 100));

    const entries = await this.db.rpc<WalletLedgerEntry[]>('get_wallet_ledger_for_user', {
      p_user_id: userId,
      p_limit: limit + 1,
      p_before: params?.before ?? null,
    });

    const rows = Array.isArray(entries) ? entries : [];
    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.created_at ?? null;
    }

    return { entries: rows, nextCursor };
  }

  async getOrderEarnings(userId: string, orderIds: string[]): Promise<OrderEarnings[]> {
    logger.info('Fetching order earnings from DB', { userId, orderCount: orderIds.length });
    const result = await this.db.rpc<OrderEarnings[]>('get_order_earnings', {
      p_order_ids: orderIds,
    });
    return Array.isArray(result) ? result : [];
  }

  async claimReviewReward(userId: string, reviewId: string): Promise<{ credited: boolean; amount_cents: number }> {
    logger.info('Claiming review reward', { userId, reviewId });
    return this.db.rpc<{ credited: boolean; amount_cents: number }>('claim_review_reward', {
      p_user_id: userId,
      p_review_id: reviewId,
    });
  }

  async getPurchaseRewardConfig(): Promise<unknown> {
    return this.db.rpc('get_purchase_reward_config');
  }

  async getVariantEarnBonuses(variantIds: string[]): Promise<unknown> {
    if (!variantIds.length) return [];
    return this.db.rpc('get_variant_earn_bonuses', {
      p_variant_ids: variantIds,
    });
  }
}
