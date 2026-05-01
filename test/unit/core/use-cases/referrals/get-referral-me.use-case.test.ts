import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetReferralMeUseCase } from '../../../../../src/core/use-cases/referrals/get-referral-me.use-case.js';
import type { ReferralMe } from '../../../../../src/core/use-cases/referrals/referral.types.js';

describe('GetReferralMeUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetReferralMeUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<GetReferralMeUseCase>(UC_TOKENS.GetReferralMe);
  });

  it('returns referral data when user is enrolled', async () => {
    const data: ReferralMe = {
      referral_code: 'REF123',
      total_referrals: 5,
      total_earned_cents: 2500,
      tier: 'gold',
    };
    mocks.referralRepo.meData.set('user-1', data);

    const result = await useCase.execute('user-1');

    expect(result).not.toBeNull();
    expect(result!.referral_code).toBe('REF123');
    expect(result!.total_referrals).toBe(5);
  });

  it('returns null when user is not enrolled', async () => {
    const result = await useCase.execute('user-no-referral');

    expect(result).toBeNull();
  });
});
