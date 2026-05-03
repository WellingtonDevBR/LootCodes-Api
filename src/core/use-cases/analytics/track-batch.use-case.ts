import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type {
  BatchEventsDto,
  PageViewEvent,
  ActivityEvent,
  SessionOutcomeDto,
  SearchEventDto,
} from './analytics.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('track-batch');

const MAX_BATCH_SIZE = 200;

@injectable()
export class TrackBatchUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  /**
   * Processes a batch of analytics events using the client's envelope format:
   * each event has { action: string, payload: Record<string, unknown> }.
   * Dispatches to the appropriate repository method based on the action field.
   */
  async execute(dto: BatchEventsDto, sessionId: string, userId?: string): Promise<number> {
    const events = dto.events.slice(0, MAX_BATCH_SIZE);
    const pageViews: PageViewEvent[] = [];
    const activityEvents: ActivityEvent[] = [];

    let processed = 0;

    for (const evt of events) {
      if (!evt.action || typeof evt.action !== 'string') continue;
      const payload = evt.payload ?? {};

      const resolvedUserId = userId ?? (payload.user_id as string | undefined);
      const resolvedSessionId = (payload.session_id as string) ?? sessionId;

      switch (evt.action) {
        case 'page-view':
          pageViews.push({
            session_id: resolvedSessionId,
            user_id: resolvedUserId,
            path: (payload.page_path ?? payload.path) as string ?? '',
            referrer: payload.referrer as string | undefined,
            timestamp: payload.timestamp as string | undefined,
          });
          processed++;
          break;

        case 'activity-event':
          activityEvents.push({
            session_id: resolvedSessionId,
            user_id: resolvedUserId,
            event_type: payload.event_type as string ?? '',
            element_id: payload.element_id as string | undefined,
            metadata: (payload.event_data ?? payload.metadata) as Record<string, unknown> | undefined,
            page_path: payload.page_path as string | undefined,
            element_selector: payload.element_selector as string | undefined,
            mouse_position: payload.mouse_position as string | undefined,
            user_agent: payload.user_agent as string | undefined,
            timestamp: payload.timestamp as string | undefined,
          });
          processed++;
          break;

        case 'product-view':
          pageViews.push({
            session_id: resolvedSessionId,
            user_id: resolvedUserId,
            path: payload.path as string ?? `/p/${payload.product_id ?? ''}`,
            referrer: payload.referrer as string | undefined,
            timestamp: payload.timestamp as string | undefined,
          });
          processed++;
          break;

        case 'product-view-duration':
          await this.analyticsRepo.trackProductViewDuration({
            session_id: resolvedSessionId,
            product_id: payload.product_id as string ?? '',
            variant_id: payload.variant_id as string | undefined,
            duration_seconds: Number(payload.duration_seconds) || 0,
            user_id: resolvedUserId,
          });
          processed++;
          break;

        case 'session-outcome':
          await this.analyticsRepo.updateSessionOutcome({
            session_id: resolvedSessionId,
            outcome: (payload.final_outcome ?? payload.outcome) as string ?? '',
            conversion_value: payload.conversion_value as number | undefined,
          } as SessionOutcomeDto);
          processed++;
          break;

        case 'session-upsert': {
          const ch = payload.client_channel;
          const client_channel =
            ch === 'web' || ch === 'mobile_app' || ch === 'unknown' ? ch : undefined;
          await this.analyticsRepo.upsertSession({
            session_id: resolvedSessionId,
            user_id: resolvedUserId,
            ip_address: (payload.ip_address as string | undefined) ?? null,
            country_code: (payload.country_code as string | undefined) ?? null,
            city: (payload.city as string | undefined) ?? null,
            region: (payload.region as string | undefined) ?? null,
            started_at: (payload.started_at as string | undefined) ?? null,
            user_agent: (payload.user_agent as string | undefined) ?? null,
            merge_anonymous: payload.merge_anonymous === true,
            auto_consolidate: payload.auto_consolidate === true,
            client_channel: client_channel ?? null,
          });
          processed++;
          break;
        }

        case 'search':
          await this.analyticsRepo.trackSearchEvent({
            session_id: resolvedSessionId,
            query: payload.query as string ?? '',
            results_count: Number(payload.results_count) || 0,
            filters: payload.filters as Record<string, unknown> | undefined,
          } as SearchEventDto);
          processed++;
          break;

        default:
          break;
      }
    }

    if (pageViews.length > 0) {
      await this.analyticsRepo.insertPageViews(pageViews);
    }
    if (activityEvents.length > 0) {
      await this.analyticsRepo.insertActivityEvents(activityEvents);
    }

    logger.debug('Batch tracked', { sessionId, processed, total: events.length });
    return processed;
  }
}
