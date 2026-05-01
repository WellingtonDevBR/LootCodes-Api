import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_LIMIT = 12;
const logger = createLogger('get-personalized-use-case');

@injectable()
export class GetPersonalizedUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(userId: string | null, sessionId: string, limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting personalized recommendations', { sessionId, limit });
    return this.recommendationRepo.getPersonalized(userId, sessionId, limit);
  }
}
