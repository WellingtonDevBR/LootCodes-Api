import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPriceMatchRepository } from '../../ports/price-match-repository.port.js';
import type { PriceMatchClaimSubmission, PriceMatchClaimResult } from './price-match.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('submit-claim-use-case');

@injectable()
export class SubmitClaimUseCase {
  constructor(
    @inject(TOKENS.PriceMatchRepository) private priceMatchRepo: IPriceMatchRepository,
  ) {}

  async execute(data: PriceMatchClaimSubmission, clientIP: string): Promise<PriceMatchClaimResult> {
    if (!data.variant_id || data.variant_id.trim().length === 0) {
      throw new ValidationError('variant_id is required');
    }
    if (!data.competitor_url || data.competitor_url.trim().length === 0) {
      throw new ValidationError('competitor_url is required');
    }
    if (!data.competitor_price_cents || data.competitor_price_cents <= 0) {
      throw new ValidationError('competitor_price_cents must be greater than 0');
    }
    if (!data.screenshot_base64 || data.screenshot_base64.trim().length === 0) {
      throw new ValidationError('screenshot_base64 is required');
    }

    logger.info('Submitting price match claim', {
      variantId: data.variant_id,
      competitorUrl: data.competitor_url,
      clientIP,
    });

    return this.priceMatchRepo.submitClaim(data);
  }
}
