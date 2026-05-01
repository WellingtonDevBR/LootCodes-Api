import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReferralRepository } from '../../ports/referral-repository.port.js';
import type { ReferralLeaderboardEntry, GetLeaderboardParams } from './referral.types.js';

@injectable()
export class GetLeaderboardUseCase {
  constructor(
    @inject(TOKENS.ReferralRepository) private referralRepo: IReferralRepository,
  ) {}

  async execute(params?: GetLeaderboardParams): Promise<ReferralLeaderboardEntry[]> {
    const days = Math.min(Math.max(params?.days ?? 30, 1), 365);
    const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);
    return this.referralRepo.getLeaderboard({ days, limit });
  }
}
