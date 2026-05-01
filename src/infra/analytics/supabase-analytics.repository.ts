import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAnalyticsRepository } from '../../core/ports/analytics-repository.port.js';
import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto, ProductViewDurationDto, SearchEventDto } from '../../core/use-cases/analytics/analytics.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-analytics-repository');

@injectable()
export class SupabaseAnalyticsRepository implements IAnalyticsRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async insertPageViews(events: PageViewEvent[]): Promise<void> {
    for (const event of events) {
      await this.db.insert('page_views', {
        session_id: event.session_id,
        user_id: event.user_id,
        path: event.path,
        referrer: event.referrer,
        timestamp: event.timestamp,
      });
    }
    logger.debug('Page views inserted', { count: events.length });
  }

  async insertActivityEvents(events: ActivityEvent[]): Promise<void> {
    for (const event of events) {
      await this.db.insert('user_activity_events', {
        session_id: event.session_id,
        user_id: event.user_id,
        event_type: event.event_type,
        element_id: event.element_id,
        metadata: event.metadata,
        timestamp: event.timestamp,
      });
    }
    logger.debug('Activity events inserted', { count: events.length });
  }

  async insertCartEvent(event: CartEvent): Promise<void> {
    await this.db.insert('cart_events', {
      session_id: event.session_id,
      user_id: event.user_id,
      action: event.action,
      variant_id: event.variant_id,
      quantity: event.quantity,
      metadata: event.metadata,
    });
  }

  async updateSessionOutcome(dto: SessionOutcomeDto): Promise<void> {
    await this.db.update('user_sessions', { id: dto.session_id }, {
      final_outcome: dto.outcome,
      conversion_value: dto.conversion_value,
    });
  }

  async trackProductViewDuration(data: ProductViewDurationDto & { user_id?: string }): Promise<void> {
    await this.db.insert('product_views', {
      session_id: data.session_id,
      product_id: data.product_id,
      variant_id: data.variant_id,
      user_id: data.user_id,
      duration_seconds: data.duration_seconds,
    });
    logger.debug('Product view duration inserted', { productId: data.product_id });
  }

  async trackSearchEvent(data: SearchEventDto): Promise<void> {
    await this.db.insert('search_analytics', {
      session_id: data.session_id,
      query: data.query,
      results_count: data.results_count,
      filters: data.filters,
    });
    logger.debug('Search event inserted', { query: data.query });
  }
}
