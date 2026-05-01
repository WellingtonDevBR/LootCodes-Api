import type { BatchEventsDto, CartEvent, SessionOutcomeDto, GeoLookupResult } from '../services/analytics/analytics.types.js';

export interface IAnalyticsService {
  trackBatch(dto: BatchEventsDto, sessionId: string, userId?: string): Promise<void>;
  trackCartEvent(event: CartEvent): Promise<void>;
  updateSessionOutcome(dto: SessionOutcomeDto): Promise<void>;
  geolocate(ipAddress: string): Promise<GeoLookupResult>;
}
