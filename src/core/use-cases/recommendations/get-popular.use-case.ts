import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { PopularProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_DAYS_BACK = 30;
const DEFAULT_LIMIT = 8;
const logger = createLogger('get-popular-use-case');

@injectable()
export class GetPopularUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(daysBack = DEFAULT_DAYS_BACK, limit = DEFAULT_LIMIT): Promise<PopularProduct[]> {
    logger.debug('Getting popular products', { daysBack, limit });
    return this.recommendationRepo.getPopular(daysBack, limit);
  }
}
