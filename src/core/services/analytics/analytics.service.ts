import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { IGeoService } from '../../ports/geo-service.port.js';
import type { IAnalyticsService } from '../../ports/analytics-service.port.js';
import type {
  BatchEventsDto,
  CartEvent,
  SessionOutcomeDto,
  GeoLookupResult,
  PageViewEvent,
  ActivityEvent,
} from './analytics.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('analytics-service');

const VALID_CART_ACTIONS = ['add', 'remove', 'checkout_started', 'checkout_completed', 'checkout_abandoned'] as const;

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
    @inject(TOKENS.GeoService) private geoService: IGeoService,
  ) {}

  async trackBatch(dto: BatchEventsDto, sessionId: string, userId?: string): Promise<void> {
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

  async trackCartEvent(event: CartEvent): Promise<void> {
    if (!VALID_CART_ACTIONS.includes(event.action)) {
      throw new ValidationError(`Invalid cart action: ${event.action}`);
    }
    await this.analyticsRepo.insertCartEvent(event);
  }

  async updateSessionOutcome(dto: SessionOutcomeDto): Promise<void> {
    await this.analyticsRepo.updateSessionOutcome(dto);
  }

  async geolocate(ipAddress: string): Promise<GeoLookupResult> {
    return this.geoService.lookupIp(ipAddress);
  }
}
