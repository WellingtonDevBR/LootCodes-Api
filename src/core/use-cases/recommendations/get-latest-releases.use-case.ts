import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IRecommendationRepository } from '../../ports/recommendation-repository.port.js';
import type { RecommendedProduct } from '../products/product.types.js';
import { createLogger } from '../../../shared/logger.js';

const DEFAULT_DAYS_BACK = 90;
const DEFAULT_LIMIT = 8;
const logger = createLogger('get-latest-releases-use-case');

@injectable()
export class GetLatestReleasesUseCase {
  constructor(
    @inject(TOKENS.RecommendationRepository) private recommendationRepo: IRecommendationRepository,
  ) {}

  async execute(daysBack = DEFAULT_DAYS_BACK, limit = DEFAULT_LIMIT): Promise<RecommendedProduct[]> {
    logger.debug('Getting latest releases', { daysBack, limit });
    return this.recommendationRepo.getLatestReleases(daysBack, limit);
  }
}
