import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReferralRepository } from '../../ports/referral-repository.port.js';
import type { IReferralService } from '../../ports/referral-service.port.js';
import type { ReferralMe, ReferralListPage, ReferralLeaderboardEntry, ListReferralsParams, GetLeaderboardParams, OpenDisputeParams, OpenDisputeResult } from './referral.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('referral-service');

@injectable()
export class ReferralService implements IReferralService {
  constructor(
    @inject(TOKENS.ReferralRepository) private referralRepo: IReferralRepository,
  ) {}

  async getMe(userId: string): Promise<ReferralMe | null> {
    return this.referralRepo.getMe(userId);
  }

  async listReferrals(userId: string, params?: ListReferralsParams): Promise<ReferralListPage> {
    return this.referralRepo.listReferrals(userId, params);
  }

  async getLeaderboard(params?: GetLeaderboardParams): Promise<ReferralLeaderboardEntry[]> {
    const days = Math.min(Math.max(params?.days ?? 30, 1), 365);
    const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);
    return this.referralRepo.getLeaderboard({ days, limit });
  }

  async openDispute(userId: string, params: OpenDisputeParams): Promise<OpenDisputeResult> {
    if (!params.referral_id || params.referral_id.trim().length === 0) {
      throw new ValidationError('referral_id is required');
    }

    const reason = params.reason?.trim() ?? '';
    if (reason.length < 10) {
      throw new ValidationError('Dispute reason must be at least 10 characters');
    }
    if (reason.length > 1000) {
      throw new ValidationError('Dispute reason must be at most 1000 characters');
    }

    logger.info('Opening referral dispute', { userId, referralId: params.referral_id });
    return this.referralRepo.openDispute(userId, { referral_id: params.referral_id, reason });
  }
}
