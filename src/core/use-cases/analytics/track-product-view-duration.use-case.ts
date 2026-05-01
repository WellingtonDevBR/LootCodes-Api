import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { ProductViewDurationDto } from './analytics.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('track-product-view-duration');

@injectable()
export class TrackProductViewDurationUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(data: ProductViewDurationDto, userId?: string): Promise<void> {
    await this.analyticsRepo.trackProductViewDuration({ ...data, user_id: userId });
    logger.debug('Product view duration tracked', { productId: data.product_id, duration: data.duration_seconds });
  }
}
