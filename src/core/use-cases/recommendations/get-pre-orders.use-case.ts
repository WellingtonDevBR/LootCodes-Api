import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_LIMIT = 10;
const logger = createLogger('get-pre-orders-use-case');

@injectable()
export class GetPreOrdersUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting pre-orders', { limit });
    return this.recommendationRepo.getPreOrders(limit);
  }
}
