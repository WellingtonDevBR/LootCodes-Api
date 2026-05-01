import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_LIMIT = 4;
const logger = createLogger('get-bought-together-use-case');

@injectable()
export class GetBoughtTogetherUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(productId: string, limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting bought-together products', { productId, limit });
    return this.recommendationRepo.getBoughtTogether(productId, limit);
  }
}
