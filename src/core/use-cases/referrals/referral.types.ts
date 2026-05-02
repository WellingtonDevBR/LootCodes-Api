export interface ReferralRewardPolicy {
  referrer_percent_bps: number;
  referrer_flat_cents: number;
  referrer_min_cents: number;
  referrer_max_cents: number;
  referee_welcome_flat_cents: number;
  min_qualifying_subtotal_cents: number;
  min_qualifying_cash_cents: number;
  ttl_days: number;
}

export interface ReferralStats {
  pending: number;
  completed: number;
  disputed: number;
  invalidated: number;
  earned_cents: number;
}

export interface ReferralMe {
  referral_code: string | null;
  can_refer: boolean;
  stats: ReferralStats;
  referred_by: {
    code: string | null;
    display_name: string;
    welcome_cents_pending: number;
    status: string;
  } | null;
  reward_policy: ReferralRewardPolicy;
}

export interface ReferralListEntry {
  id: string;
  status: string;
  referral_code: string;
  counterparty_display_name: string;
  grant_cents: number;
  qualifying_order_id: string | null;
  qualifying_progress_cents: number;
  dispute_reason: string | null;
  dispute_resolution: string | null;
  invalidated_reason: string | null;
  created_at: string;
  completed_at: string | null;
  dispute_opened_at: string | null;
  dispute_resolved_at: string | null;
}

export interface ReferralListPage {
  entries: ReferralListEntry[];
  nextCursor: string | null;
  role: 'referrer' | 'referee';
}

export interface ReferralLeaderboardEntry {
  rank: number;
  display_name: string;
  referral_count: number;
  earned_cents: number;
}

export interface ListReferralsParams {
  role?: 'referrer' | 'referee';
  limit?: number;
  before?: string;
}

export interface GetLeaderboardParams {
  days?: number;
  limit?: number;
}

export interface OpenDisputeParams {
  referral_id: string;
  reason: string;
}

export interface OpenDisputeResult {
  ok: boolean;
  referral_id?: string;
  reason?: string;
  error?: string;
}
