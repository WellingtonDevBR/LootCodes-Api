import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_DAYS_BACK = 30;
const DEFAULT_LIMIT = 8;
const logger = createLogger('get-also-viewed-use-case');

@injectable()
export class GetAlsoViewedUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(productId: string, daysBack = DEFAULT_DAYS_BACK, limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting also-viewed products', { productId, daysBack, limit });
    return this.recommendationRepo.getAlsoViewed(productId, daysBack, limit);
  }
}
