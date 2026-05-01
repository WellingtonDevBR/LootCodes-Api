import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReferralRepository } from '../../ports/referral-repository.port.js';
import type { ReferralListPage, ListReferralsParams } from './referral.types.js';

@injectable()
export class ListReferralsUseCase {
  constructor(
    @inject(TOKENS.ReferralRepository) private referralRepo: IReferralRepository,
  ) {}

  async execute(userId: string, params?: ListReferralsParams): Promise<ReferralListPage> {
    return this.referralRepo.listReferrals(userId, params);
  }
}
