import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReferralRepository } from '../../core/ports/referral-repository.port.js';
import type { ReferralMe, ReferralListPage, ReferralLeaderboardEntry, ListReferralsParams, GetLeaderboardParams, OpenDisputeParams, OpenDisputeResult } from '../../core/services/referrals/referral.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-referral-repository');

@injectable()
export class SupabaseReferralRepository implements IReferralRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getMe(userId: string): Promise<ReferralMe | null> {
    return this.db.rpc<ReferralMe | null>('referral_get_me', {
      p_user_id: userId,
    });
  }

  async listReferrals(userId: string, params?: ListReferralsParams): Promise<ReferralListPage> {
    return this.db.rpc<ReferralListPage>('referral_list', {
      p_user_id: userId,
      p_role: params?.role ?? 'referrer',
      p_limit: params?.limit ?? 20,
      p_before: params?.before ?? null,
    });
  }

  async getLeaderboard(params?: GetLeaderboardParams): Promise<ReferralLeaderboardEntry[]> {
    return this.db.rpc<ReferralLeaderboardEntry[]>('referral_leaderboard', {
      p_days: params?.days ?? 30,
      p_limit: params?.limit ?? 20,
    });
  }

  async openDispute(userId: string, params: OpenDisputeParams): Promise<OpenDisputeResult> {
    logger.info('Opening referral dispute via RPC', { userId, referralId: params.referral_id });
    return this.db.rpc<OpenDisputeResult>('referral_dispute_open', {
      p_user_id: userId,
      p_referral_id: params.referral_id,
      p_reason: params.reason,
    });
  }
}
