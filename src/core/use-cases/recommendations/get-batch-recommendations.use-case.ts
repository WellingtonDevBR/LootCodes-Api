import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendationsBatch } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_SIMILAR_LIMIT = 8;
const DEFAULT_ALSO_VIEWED_LIMIT = 8;
const DEFAULT_BOUGHT_TOGETHER_LIMIT = 4;
const logger = createLogger('get-batch-recommendations-use-case');

@injectable()
export class GetBatchRecommendationsUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(productId: string): Promise<RecommendationsBatch> {
    logger.debug('Getting recommendations batch', { productId });
    return this.recommendationRepo.getBatch(
      productId,
      DEFAULT_SIMILAR_LIMIT,
      DEFAULT_ALSO_VIEWED_LIMIT,
      DEFAULT_BOUGHT_TOGETHER_LIMIT,
    );
  }
}
