import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReferralRepository } from '../../ports/referral-repository.port.js';
import type { ReferralMe } from './referral.types.js';

@injectable()
export class GetReferralMeUseCase {
  constructor(
    @inject(TOKENS.ReferralRepository) private referralRepo: IReferralRepository,
  ) {}

  async execute(userId: string): Promise<ReferralMe | null> {
    return this.referralRepo.getMe(userId);
  }
}
