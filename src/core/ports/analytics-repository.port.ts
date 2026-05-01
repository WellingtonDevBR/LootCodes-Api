import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto } from '../services/analytics/analytics.types.js';

export interface IAnalyticsRepository {
  insertPageViews(events: PageViewEvent[]): Promise<void>;
  insertActivityEvents(events: ActivityEvent[]): Promise<void>;
  insertCartEvent(event: CartEvent): Promise<void>;
  updateSessionOutcome(dto: SessionOutcomeDto): Promise<void>;
}
