import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { TrackBatchUseCase } from '../../../../src/core/use-cases/analytics/track-batch.use-case.js';
import { createMockAnalyticsRepository } from '../../../helpers/mock-analytics-repository.js';

describe('TrackBatchUseCase', () => {
  let useCase: TrackBatchUseCase;
  let mockRepo: ReturnType<typeof createMockAnalyticsRepository>;

  const SESSION_ID = 'test-session-123';
  const USER_ID = 'user-abc';

  beforeEach(() => {
    mockRepo = createMockAnalyticsRepository();
    useCase = new TrackBatchUseCase(mockRepo);
  });

  it('parses page-view events from envelope format', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'page-view', payload: { path: '/products', referrer: '/home' } },
          { action: 'page-view', payload: { path: '/cart' } },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(processed).toBe(2);
    expect(mockRepo.pageViews).toHaveLength(2);
    expect(mockRepo.pageViews[0]).toMatchObject({
      session_id: SESSION_ID,
      user_id: USER_ID,
      path: '/products',
      referrer: '/home',
    });
    expect(mockRepo.pageViews[1]).toMatchObject({
      session_id: SESSION_ID,
      path: '/cart',
    });
  });

  it('parses activity-event events from envelope format', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'activity-event', payload: { event_type: 'click', element_id: 'buy-btn' } },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.activityEvents).toHaveLength(1);
    expect(mockRepo.activityEvents[0]).toMatchObject({
      session_id: SESSION_ID,
      user_id: USER_ID,
      event_type: 'click',
      element_id: 'buy-btn',
    });
  });

  it('parses product-view events as page views', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'product-view', payload: { product_id: 'prod-1', path: '/p/game-a' } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.pageViews).toHaveLength(1);
    expect(mockRepo.pageViews[0].path).toBe('/p/game-a');
  });

  it('parses product-view-duration events', async () => {
    const processed = await useCase.execute(
      {
        events: [
          {
            action: 'product-view-duration',
            payload: { product_id: 'prod-1', variant_id: 'var-1', duration_seconds: 45 },
          },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.productViewDurations).toHaveLength(1);
    expect(mockRepo.productViewDurations[0]).toMatchObject({
      session_id: SESSION_ID,
      product_id: 'prod-1',
      variant_id: 'var-1',
      duration_seconds: 45,
      user_id: USER_ID,
    });
  });

  it('parses session-outcome events', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'session-outcome', payload: { outcome: 'purchase', conversion_value: 2999 } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.sessionOutcomes).toHaveLength(1);
    expect(mockRepo.sessionOutcomes[0]).toMatchObject({
      session_id: SESSION_ID,
      outcome: 'purchase',
      conversion_value: 2999,
    });
  });

  it('parses session-upsert events', async () => {
    const processed = await useCase.execute(
      {
        events: [
          {
            action: 'session-upsert',
            payload: {
              page_path: '/checkout',
              traffic_source: 'google',
              device_type: 'mobile',
              browser: 'Chrome',
              os: 'iOS',
              country_code: 'US',
            },
          },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.sessionUpserts).toHaveLength(1);
    expect(mockRepo.sessionUpserts[0]).toMatchObject({
      session_id: SESSION_ID,
      user_id: USER_ID,
      page_path: '/checkout',
      traffic_source: 'google',
      device_type: 'mobile',
      browser: 'Chrome',
      os: 'iOS',
      country_code: 'US',
    });
  });

  it('parses search events', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'search', payload: { query: 'FIFA', results_count: 12 } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.searchEvents).toHaveLength(1);
    expect(mockRepo.searchEvents[0]).toMatchObject({
      session_id: SESSION_ID,
      query: 'FIFA',
      results_count: 12,
    });
  });

  it('handles mixed event types in a single batch', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'page-view', payload: { path: '/home' } },
          { action: 'activity-event', payload: { event_type: 'scroll' } },
          { action: 'session-outcome', payload: { outcome: 'browse' } },
          { action: 'product-view-duration', payload: { product_id: 'p1', duration_seconds: 10 } },
          { action: 'session-upsert', payload: { device_type: 'desktop' } },
          { action: 'search', payload: { query: 'test', results_count: 3 } },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(processed).toBe(6);
    expect(mockRepo.pageViews).toHaveLength(1);
    expect(mockRepo.activityEvents).toHaveLength(1);
    expect(mockRepo.sessionOutcomes).toHaveLength(1);
    expect(mockRepo.productViewDurations).toHaveLength(1);
    expect(mockRepo.sessionUpserts).toHaveLength(1);
    expect(mockRepo.searchEvents).toHaveLength(1);
  });

  it('skips events with unknown action types', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'unknown-event', payload: { data: 'test' } },
          { action: 'page-view', payload: { path: '/valid' } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.pageViews).toHaveLength(1);
  });

  it('skips events with empty or missing action', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: '', payload: { path: '/bad' } },
          { action: 'page-view', payload: { path: '/good' } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
  });

  it('caps batch at 200 events', async () => {
    const events = Array.from({ length: 250 }, (_, i) => ({
      action: 'page-view',
      payload: { path: `/page-${i}` },
    }));

    const processed = await useCase.execute({ events }, SESSION_ID);

    expect(processed).toBe(200);
    expect(mockRepo.pageViews).toHaveLength(200);
  });

  it('uses payload session_id over top-level session_id when present', async () => {
    const processed = await useCase.execute(
      {
        events: [
          { action: 'page-view', payload: { session_id: 'custom-session', path: '/override' } },
        ],
      },
      SESSION_ID,
    );

    expect(processed).toBe(1);
    expect(mockRepo.pageViews[0].session_id).toBe('custom-session');
  });

  it('top-level userId overrides payload user_id (authenticated user)', async () => {
    await useCase.execute(
      {
        events: [
          { action: 'page-view', payload: { user_id: 'payload-user', path: '/test' } },
        ],
      },
      SESSION_ID,
      USER_ID,
    );

    expect(mockRepo.pageViews[0].user_id).toBe(USER_ID);
  });

  it('falls back to payload user_id when no top-level userId', async () => {
    await useCase.execute(
      {
        events: [
          { action: 'activity-event', payload: { user_id: 'payload-user', event_type: 'hover' } },
        ],
      },
      SESSION_ID,
    );

    expect(mockRepo.activityEvents[0].user_id).toBe('payload-user');
  });

  it('returns 0 for empty events', async () => {
    const processed = await useCase.execute(
      { events: [] },
      SESSION_ID,
    );

    expect(processed).toBe(0);
  });
});
