import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReferralRepository } from '../../ports/referral-repository.port.js';
import type { OpenDisputeParams, OpenDisputeResult } from './referral.types.js';

@injectable()
export class OpenDisputeUseCase {
  constructor(
    @inject(TOKENS.ReferralRepository) private referralRepo: IReferralRepository,
  ) {}

  async execute(userId: string, params: OpenDisputeParams): Promise<OpenDisputeResult> {
    return this.referralRepo.openDispute(userId, params);
  }
}
