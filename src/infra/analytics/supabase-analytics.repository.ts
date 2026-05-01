import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAnalyticsRepository } from '../../core/ports/analytics-repository.port.js';
import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto } from '../../core/services/analytics/analytics.types.js';
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
}
