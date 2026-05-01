import type { IAnalyticsRepository } from '../../src/core/ports/analytics-repository.port.js';
import type {
  PageViewEvent,
  ActivityEvent,
  CartEvent,
  SessionOutcomeDto,
  ProductViewDurationDto,
  SearchEventDto,
  SessionUpsertDto,
} from '../../src/core/use-cases/analytics/analytics.types.js';

export function createMockAnalyticsRepository(): IAnalyticsRepository & {
  pageViews: PageViewEvent[];
  activityEvents: ActivityEvent[];
  cartEvents: CartEvent[];
  sessionOutcomes: SessionOutcomeDto[];
  productViewDurations: (ProductViewDurationDto & { user_id?: string })[];
  searchEvents: SearchEventDto[];
  sessionUpserts: SessionUpsertDto[];
} {
  const mock = {
    pageViews: [] as PageViewEvent[],
    activityEvents: [] as ActivityEvent[],
    cartEvents: [] as CartEvent[],
    sessionOutcomes: [] as SessionOutcomeDto[],
    productViewDurations: [] as (ProductViewDurationDto & { user_id?: string })[],
    searchEvents: [] as SearchEventDto[],
    sessionUpserts: [] as SessionUpsertDto[],

    async insertPageViews(events: PageViewEvent[]): Promise<void> {
      mock.pageViews.push(...events);
    },
    async insertActivityEvents(events: ActivityEvent[]): Promise<void> {
      mock.activityEvents.push(...events);
    },
    async insertCartEvent(event: CartEvent): Promise<void> {
      mock.cartEvents.push(event);
    },
    async updateSessionOutcome(dto: SessionOutcomeDto): Promise<void> {
      mock.sessionOutcomes.push(dto);
    },
    async trackProductViewDuration(data: ProductViewDurationDto & { user_id?: string }): Promise<void> {
      mock.productViewDurations.push(data);
    },
    async trackSearchEvent(data: SearchEventDto): Promise<void> {
      mock.searchEvents.push(data);
    },
    async upsertSession(dto: SessionUpsertDto): Promise<void> {
      mock.sessionUpserts.push(dto);
    },
  };

  return mock;
}
