import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPriceMatchRepository } from '../../ports/price-match-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-claim-promo-code-use-case');

@injectable()
export class GetClaimPromoCodeUseCase {
  constructor(
    @inject(TOKENS.PriceMatchRepository) private priceMatchRepo: IPriceMatchRepository,
  ) {}

  async execute(userId: string, promoCodeId: string): Promise<string | null> {
    if (!promoCodeId || promoCodeId.trim().length === 0) {
      throw new ValidationError('promoCodeId is required');
    }

    logger.info('Fetching claim promo code', { userId, promoCodeId });
    return this.priceMatchRepo.getClaimPromoCode(promoCodeId);
  }
}
