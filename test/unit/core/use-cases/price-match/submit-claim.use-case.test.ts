import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { SubmitClaimUseCase } from '../../../../../src/core/use-cases/price-match/submit-claim.use-case.js';

describe('SubmitClaimUseCase', () => {
  let mocks: TestMocks;
  let useCase: SubmitClaimUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<SubmitClaimUseCase>(UC_TOKENS.SubmitClaim);
  });

  it('submits a claim successfully', async () => {
    const result = await useCase.execute(
      {
        variant_id: 'variant-1',
        competitor_url: 'https://competitor.com/product',
        competitor_price_cents: 1999,
        screenshot_base64: 'data:image/png;base64,abc123',
      },
      '1.2.3.4',
    );

    expect(result.success).toBe(true);
    expect(result.claim_id).toBeDefined();
    expect(result.expires_at).toBeDefined();
  });
});
