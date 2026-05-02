import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAnalyticsRepository } from '../../core/ports/analytics-repository.port.js';
import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto, ProductViewDurationDto, SearchEventDto, SessionUpsertDto } from '../../core/use-cases/analytics/analytics.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-analytics-repository');

@injectable()
export class SupabaseAnalyticsRepository implements IAnalyticsRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async insertPageViews(events: PageViewEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await this.db.insert('page_views', {
          session_id: event.session_id,
          user_id: event.user_id,
          page_path: event.path,
          referrer: event.referrer,
        });
      } catch (err) {
        logger.warn('Page view insert failed (FK or constraint)', { sessionId: event.session_id, error: String(err) });
      }
    }
    logger.debug('Page views inserted', { count: events.length });
  }

  async insertActivityEvents(events: ActivityEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await this.db.insert('user_activity_events', {
          session_id: event.session_id,
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.metadata ?? {},
          page_path: event.page_path,
          element_selector: event.element_selector,
          mouse_position: event.mouse_position,
          user_agent: event.user_agent,
        });
      } catch (err) {
        logger.warn('Activity event insert failed (FK or constraint)', { sessionId: event.session_id, error: String(err) });
      }
    }
    logger.debug('Activity events inserted', { count: events.length });
  }

  async insertCartEvent(event: CartEvent): Promise<void> {
    const extraContext: Record<string, unknown> = {};
    if (event.product_id) extraContext.product_id = event.product_id;
    if (event.cart_value != null) extraContext.cart_value = event.cart_value;
    if (event.guest_email) extraContext.guest_email = event.guest_email;
    if (event.user_agent) extraContext.user_agent = event.user_agent;
    if (event.page_path) extraContext.page_path = event.page_path;

    const merged = Object.keys(extraContext).length > 0 || event.metadata
      ? { ...extraContext, ...event.metadata }
      : undefined;

    await this.db.insert('cart_events', {
      session_id: event.session_id,
      user_id: event.user_id,
      action: event.event_type,
      variant_id: event.variant_id,
      quantity: event.quantity,
      metadata: merged,
    });
  }

  async updateSessionOutcome(dto: SessionOutcomeDto): Promise<void> {
    try {
      await this.db.update('user_sessions', { session_id: dto.session_id }, {
        final_outcome: dto.outcome,
        conversion_value: dto.conversion_value,
      });
    } catch (err) {
      logger.warn('Session outcome update failed', { sessionId: dto.session_id, error: String(err) });
    }
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

  async upsertSession(dto: SessionUpsertDto): Promise<void> {
    await this.db.rpc('upsert_user_session', {
      p_session_id: dto.session_id,
      p_user_id: dto.user_id ?? null,
      p_page_path: dto.page_path ?? null,
      p_referrer: dto.referrer ?? null,
      p_traffic_source: dto.traffic_source ?? null,
      p_utm_source: dto.utm_source ?? null,
      p_utm_medium: dto.utm_medium ?? null,
      p_utm_campaign: dto.utm_campaign ?? null,
      p_device_type: dto.device_type ?? null,
      p_browser: dto.browser ?? null,
      p_os: dto.os ?? null,
      p_screen_resolution: dto.screen_resolution ?? null,
      p_language: dto.language ?? null,
      p_country_code: dto.country_code ?? null,
    });
    logger.debug('Session upserted', { sessionId: dto.session_id });
  }
}
