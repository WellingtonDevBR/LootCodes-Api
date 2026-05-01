import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { SearchEventDto } from './analytics.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('track-search-event');

@injectable()
export class TrackSearchEventUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(data: SearchEventDto): Promise<void> {
    await this.analyticsRepo.trackSearchEvent(data);
    logger.debug('Search event tracked', { query: data.query, resultsCount: data.results_count });
  }
}
