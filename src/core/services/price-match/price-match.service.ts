import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPriceMatchRepository } from '../../ports/price-match-repository.port.js';
import type { IPriceMatchService } from '../../ports/price-match-service.port.js';
import type { PriceMatchClaim, PriceMatchClaimSubmission, PriceMatchClaimResult, PriceMatchConfig } from './price-match.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('price-match-service');

@injectable()
export class PriceMatchService implements IPriceMatchService {
  constructor(
    @inject(TOKENS.PriceMatchRepository) private priceMatchRepo: IPriceMatchRepository,
  ) {}

  async submitClaim(data: PriceMatchClaimSubmission, clientIP: string): Promise<PriceMatchClaimResult> {
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

  async getUserClaims(userId: string): Promise<PriceMatchClaim[]> {
    return this.priceMatchRepo.getUserClaims(userId);
  }

  async getConfig(): Promise<PriceMatchConfig | null> {
    return this.priceMatchRepo.getConfig();
  }

  async getClaimPromoCode(userId: string, promoCodeId: string): Promise<string | null> {
    if (!promoCodeId || promoCodeId.trim().length === 0) {
      throw new ValidationError('promoCodeId is required');
    }

    logger.info('Fetching claim promo code', { userId, promoCodeId });
    return this.priceMatchRepo.getClaimPromoCode(promoCodeId);
  }
}
