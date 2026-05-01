import type { ReferralMe, ReferralListPage, ReferralLeaderboardEntry, ListReferralsParams, GetLeaderboardParams, OpenDisputeParams, OpenDisputeResult } from '../services/referrals/referral.types.js';

export interface IReferralService {
  getMe(userId: string): Promise<ReferralMe | null>;
  listReferrals(userId: string, params?: ListReferralsParams): Promise<ReferralListPage>;
  getLeaderboard(params?: GetLeaderboardParams): Promise<ReferralLeaderboardEntry[]>;
  openDispute(userId: string, params: OpenDisputeParams): Promise<OpenDisputeResult>;
}
