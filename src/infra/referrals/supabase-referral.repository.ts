import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReferralRepository } from '../../core/ports/referral-repository.port.js';
import type {
  ReferralMe,
  ReferralListPage,
  ReferralLeaderboardEntry,
  ListReferralsParams,
  GetLeaderboardParams,
  OpenDisputeParams,
  OpenDisputeResult,
} from '../../core/use-cases/referrals/referral.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-referral-repository');

interface ReferralRow {
  status: string;
  referrer_user_id: string;
  referee_user_id: string;
  referrer_grant_cents: number | null;
  referee_grant_cents: number | null;
  referral_code: string | null;
}

function anonymiseDisplayName(raw: string | null | undefined): string {
  if (!raw || raw.trim() === '') return 'Anonymous';
  const clean = raw.trim();
  if (clean.includes(' ')) {
    const parts = clean.split(/\s+/);
    return `${parts[0][0].toUpperCase()}. ${parts[parts.length - 1][0].toUpperCase()}.`;
  }
  if (clean.length <= 2) return `${clean[0].toUpperCase()}***`;
  return `${clean[0]}***${clean[clean.length - 1]}`;
}

@injectable()
export class SupabaseReferralRepository implements IReferralRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getMe(userId: string): Promise<ReferralMe | null> {
    const profile = await this.db.queryOne<{
      referral_code: string | null;
      account_claim_status: string | null;
    }>('profiles', {
      select: 'referral_code, account_claim_status',
      eq: [['user_id', userId]],
    });

    if (!profile) return null;

    const isGuest = profile.account_claim_status === 'guest';

    const asReferrerRows = await this.db.query<ReferralRow>('referrals', {
      select: 'status, referrer_grant_cents',
      eq: [['referrer_user_id', userId]],
    });

    const stats = { pending: 0, completed: 0, disputed: 0, invalidated: 0, earned_cents: 0 };
    for (const row of asReferrerRows) {
      if (row.status === 'pending_first_order') stats.pending += 1;
      else if (row.status === 'completed') stats.completed += 1;
      else if (row.status === 'disputed') stats.disputed += 1;
      else if (row.status === 'invalidated') stats.invalidated += 1;
      if (row.status === 'completed') {
        stats.earned_cents += row.referrer_grant_cents ?? 0;
      }
    }

    const attachedRow = await this.db.queryOne<{
      referral_code: string | null;
      referrer_user_id: string;
      referee_grant_cents: number | null;
      status: string;
    }>('referrals', {
      select: 'referral_code, referrer_user_id, referee_grant_cents, status',
      eq: [['referee_user_id', userId]],
    });

    let referredBy: ReferralMe['referred_by'] = null;
    if (attachedRow) {
      const refProfile = await this.db.queryOne<{
        full_name: string | null;
        username: string | null;
      }>('profiles', {
        select: 'full_name, username',
        eq: [['user_id', attachedRow.referrer_user_id]],
      });
      referredBy = {
        code: attachedRow.referral_code ?? null,
        display_name: anonymiseDisplayName(refProfile?.full_name || refProfile?.username),
        welcome_cents_pending:
          attachedRow.status === 'pending_first_order'
            ? (attachedRow.referee_grant_cents ?? 0)
            : 0,
        status: attachedRow.status,
      };
    }

    const policyRow = await this.db.queryOne<{ config_value: Record<string, unknown> }>(
      'security_config',
      { select: 'config_value', eq: [['config_key', 'referral_rewards']] },
    );

    const raw = policyRow?.config_value ?? {};
    const rewardPolicy = {
      referrer_percent_bps: Number(raw.referrer_percent_bps ?? 500),
      referrer_flat_cents: Number(raw.referrer_flat_cents ?? 0),
      referrer_min_cents: Number(raw.referrer_min_cents ?? 100),
      referrer_max_cents: Number(raw.referrer_max_cents ?? 5000),
      referee_welcome_flat_cents: Number(raw.referee_welcome_flat_cents ?? 500),
      min_qualifying_subtotal_cents: Number(raw.min_qualifying_subtotal_cents ?? 3000),
      min_qualifying_cash_cents: Number(raw.min_qualifying_cash_cents ?? 3000),
      ttl_days: Number(raw.ttl_days ?? 365),
    };

    return {
      referral_code: profile.referral_code ?? null,
      can_refer: !isGuest && !!profile.referral_code,
      stats,
      referred_by: referredBy,
      reward_policy: rewardPolicy,
    };
  }

  async listReferrals(userId: string, params?: ListReferralsParams): Promise<ReferralListPage> {
    const role = params?.role ?? 'referrer';
    const limit = Math.min(Math.max(params?.limit ?? 20, 1), 50);
    const eqCol = role === 'referrer' ? 'referrer_user_id' : 'referee_user_id';

    const rows = await this.db.query<{
      id: string;
      status: string;
      referral_code: string | null;
      referrer_user_id: string;
      referee_user_id: string;
      referrer_grant_cents: number | null;
      referee_grant_cents: number | null;
      qualifying_order_id: string | null;
      dispute_reason: string | null;
      dispute_resolution: string | null;
      invalidated_reason: string | null;
      created_at: string;
      completed_at: string | null;
      dispute_opened_at: string | null;
      dispute_resolved_at: string | null;
    }>('referrals', {
      select: 'id, status, referral_code, referrer_user_id, referee_user_id, referrer_grant_cents, referee_grant_cents, qualifying_order_id, dispute_reason, dispute_resolution, invalidated_reason, created_at, completed_at, dispute_opened_at, dispute_resolved_at',
      eq: [[eqCol, userId]],
      order: { column: 'created_at', ascending: false },
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const entries = rows.slice(0, limit);
    const nextCursor = hasMore ? entries[entries.length - 1]?.created_at ?? null : null;

    const counterpartyIds = entries.map((r) =>
      role === 'referrer' ? r.referee_user_id : r.referrer_user_id,
    );

    let profileMap: Record<string, { full_name: string | null; username: string | null }> = {};
    if (counterpartyIds.length > 0) {
      const profiles = await this.db.query<{
        user_id: string;
        full_name: string | null;
        username: string | null;
      }>('profiles', {
        select: 'user_id, full_name, username',
        in: [['user_id', counterpartyIds]],
      });
      for (const p of profiles) {
        profileMap[p.user_id] = p;
      }
    }

    return {
      entries: entries.map((r) => {
        const cpId = role === 'referrer' ? r.referee_user_id : r.referrer_user_id;
        const cpProfile = profileMap[cpId];
        return {
          id: r.id,
          status: r.status,
          referral_code: r.referral_code ?? '',
          counterparty_display_name: anonymiseDisplayName(
            cpProfile?.full_name || cpProfile?.username,
          ),
          grant_cents:
            role === 'referrer'
              ? (r.referrer_grant_cents ?? 0)
              : (r.referee_grant_cents ?? 0),
          qualifying_order_id: r.qualifying_order_id ?? null,
          qualifying_progress_cents: 0,
          dispute_reason: r.dispute_reason ?? null,
          dispute_resolution: r.dispute_resolution ?? null,
          invalidated_reason: r.invalidated_reason ?? null,
          created_at: r.created_at,
          completed_at: r.completed_at ?? null,
          dispute_opened_at: r.dispute_opened_at ?? null,
          dispute_resolved_at: r.dispute_resolved_at ?? null,
        };
      }),
      nextCursor,
      role,
    };
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
      p_referral_id: params.referral_id,
      p_user_id: userId,
      p_reason: params.reason,
    });
  }
}
