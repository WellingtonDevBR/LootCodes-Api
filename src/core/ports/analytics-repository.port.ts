import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto, ProductViewDurationDto, SearchEventDto, SessionUpsertDto } from '../use-cases/analytics/analytics.types.js';

export interface IAnalyticsRepository {
  insertPageViews(events: PageViewEvent[]): Promise<void>;
  insertActivityEvents(events: ActivityEvent[]): Promise<void>;
  insertCartEvent(event: CartEvent): Promise<void>;
  updateSessionOutcome(dto: SessionOutcomeDto): Promise<void>;
  trackProductViewDuration(data: ProductViewDurationDto & { user_id?: string }): Promise<void>;
  trackSearchEvent(data: SearchEventDto): Promise<void>;
  upsertSession(dto: SessionUpsertDto): Promise<void>;
}
