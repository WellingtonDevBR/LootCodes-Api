import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { BatchEventsDto, PageViewEvent, ActivityEvent } from './analytics.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('track-batch');

@injectable()
export class TrackBatchUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(dto: BatchEventsDto, sessionId: string, userId?: string): Promise<void> {
    const pageViews: PageViewEvent[] = [];
    const activityEvents: ActivityEvent[] = [];

    for (const event of dto.events) {
      const enriched = { ...event, session_id: sessionId, user_id: userId ?? event.user_id };

      if ('path' in event) {
        pageViews.push(enriched as PageViewEvent);
      } else if ('event_type' in event) {
        activityEvents.push(enriched as ActivityEvent);
      }
    }

    if (pageViews.length > 0) {
      await this.analyticsRepo.insertPageViews(pageViews);
    }
    if (activityEvents.length > 0) {
      await this.analyticsRepo.insertActivityEvents(activityEvents);
    }

    logger.debug('Batch tracked', { sessionId, pageViews: pageViews.length, activityEvents: activityEvents.length });
  }
}
