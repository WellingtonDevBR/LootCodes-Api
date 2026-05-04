import { injectable, inject } from 'tsyringe';

import { TOKENS } from '../../di/tokens.js';

import type { IDatabase } from '../../core/ports/database.port.js';

import type { IAnalyticsRepository } from '../../core/ports/analytics-repository.port.js';

import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto, ProductViewDurationDto, SearchEventDto, SessionUpsertDto } from '../../core/use-cases/analytics/analytics.types.js';

import { inetColumnOrNull } from '../../shared/client-ip.js';

import { createLogger } from '../../shared/logger.js';



const logger = createLogger('supabase-analytics-repository');



function trim2(code: string | null | undefined): string | null {

  if (!code || typeof code !== 'string') return null;

  const s = code.trim().slice(0, 2);

  return s.length === 2 ? s.toUpperCase() : null;

}



/** Edge `analytics-event.ts` session-upsert: null channel when unknown. */

function rpcClientChannel(

  dto: SessionUpsertDto,

): string | null {

  const c = dto.client_channel ?? null;

  if (c === 'web' || c === 'mobile_app') return c;

  return null;

}



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

    const meta = (event.metadata ?? {}) as Record<string, unknown>;

    const productId = event.product_id ?? meta.productId as string | undefined;

    const variantId = event.variant_id ?? meta.variantId as string | undefined;



    await this.db.insert('cart_events', {

      session_id: event.session_id,

      user_id: event.user_id,

      event_type: event.event_type,

      product_id: productId,

      variant_id: variantId,

      quantity: event.quantity,

      cart_value: event.cart_value,

      guest_email: event.guest_email,

      user_agent: event.user_agent,

      page_path: event.page_path,

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

      user_id: data.user_id,

      view_duration_seconds: data.duration_seconds,

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

    const started =

      dto.started_at && typeof dto.started_at === 'string' && dto.started_at.trim().length > 0

        ? dto.started_at.trim()

        : null;



    await this.db.rpc('upsert_user_session', {

      p_session_id: dto.session_id,

      p_user_id: dto.user_id && dto.user_id.length > 0 ? dto.user_id : null,

      p_ip_address: inetColumnOrNull(dto.ip_address ?? undefined),

      p_country_code: trim2(dto.country_code ?? undefined),

      p_city:

        dto.city && dto.city.trim().length > 0 ? dto.city.trim().slice(0, 100) : null,

      p_region:

        dto.region && dto.region.trim().length > 0 ? dto.region.trim().slice(0, 100) : null,

      p_started_at: started,

      p_user_agent:

        dto.user_agent && dto.user_agent.trim().length > 0 ? dto.user_agent.trim().slice(0, 500) : null,

      p_merge_anonymous: dto.merge_anonymous === true,

      p_auto_consolidate: dto.auto_consolidate === true,

      p_client_channel: rpcClientChannel(dto),

    });

    logger.debug('Session upserted', { sessionId: dto.session_id });

  }

}

