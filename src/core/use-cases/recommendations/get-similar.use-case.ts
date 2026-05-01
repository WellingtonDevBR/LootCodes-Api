import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_LIMIT = 8;
const logger = createLogger('get-similar-use-case');

@injectable()
export class GetSimilarUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(productId: string, limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting similar products', { productId, limit });
    return this.recommendationRepo.getSimilar(productId, limit);
  }
}
