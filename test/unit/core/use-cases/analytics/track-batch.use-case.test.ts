import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackBatchUseCase } from '../../../../../src/core/use-cases/analytics/track-batch.use-case.js';
import type { IAnalyticsRepository } from '../../../../../src/core/ports/analytics-repository.port.js';

describe('TrackBatchUseCase', () => {
  let useCase: TrackBatchUseCase;
  let analyticsRepo: {
    insertPageViews: ReturnType<typeof vi.fn>;
    insertActivityEvents: ReturnType<typeof vi.fn>;
    insertCartEvent: ReturnType<typeof vi.fn>;
    updateSessionOutcome: ReturnType<typeof vi.fn>;
    trackProductViewDuration: ReturnType<typeof vi.fn>;
    trackSearchEvent: ReturnType<typeof vi.fn>;
    upsertSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    analyticsRepo = {
      insertPageViews: vi.fn().mockResolvedValue(undefined),
      insertActivityEvents: vi.fn().mockResolvedValue(undefined),
      insertCartEvent: vi.fn(),
      updateSessionOutcome: vi.fn().mockResolvedValue(undefined),
      trackProductViewDuration: vi.fn().mockResolvedValue(undefined),
      trackSearchEvent: vi.fn().mockResolvedValue(undefined),
      upsertSession: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new TrackBatchUseCase(analyticsRepo as unknown as IAnalyticsRepository);
  });

  it('should split events into page views and activity events', async () => {
    const events = [
      { action: 'page-view', payload: { path: '/home', referrer: '' } },
      { action: 'activity-event', payload: { event_type: 'click', element_id: 'btn-1' } },
      { action: 'page-view', payload: { path: '/products' } },
    ];

    await useCase.execute({ events }, 'session-1', 'user-1');

    expect(analyticsRepo.insertPageViews).toHaveBeenCalledTimes(1);
    const pageViews = analyticsRepo.insertPageViews.mock.calls[0][0];
    expect(pageViews).toHaveLength(2);
    expect(pageViews[0]).toMatchObject({ session_id: 'session-1', user_id: 'user-1', path: '/home' });
    expect(pageViews[1]).toMatchObject({ session_id: 'session-1', user_id: 'user-1', path: '/products' });

    expect(analyticsRepo.insertActivityEvents).toHaveBeenCalledTimes(1);
    const activityEvents = analyticsRepo.insertActivityEvents.mock.calls[0][0];
    expect(activityEvents).toHaveLength(1);
    expect(activityEvents[0]).toMatchObject({ session_id: 'session-1', user_id: 'user-1', event_type: 'click' });
  });

  it('should skip insertPageViews when no page views present', async () => {
    const events = [
      { action: 'activity-event', payload: { event_type: 'scroll' } },
    ];

    await useCase.execute({ events }, 'session-1');

    expect(analyticsRepo.insertPageViews).not.toHaveBeenCalled();
    expect(analyticsRepo.insertActivityEvents).toHaveBeenCalledTimes(1);
  });

  it('should skip insertActivityEvents when no activity events present', async () => {
    const events = [
      { action: 'page-view', payload: { path: '/home' } },
    ];

    await useCase.execute({ events }, 'session-1');

    expect(analyticsRepo.insertPageViews).toHaveBeenCalledTimes(1);
    expect(analyticsRepo.insertActivityEvents).not.toHaveBeenCalled();
  });

  it('should handle empty events array', async () => {
    await useCase.execute({ events: [] }, 'session-1');

    expect(analyticsRepo.insertPageViews).not.toHaveBeenCalled();
    expect(analyticsRepo.insertActivityEvents).not.toHaveBeenCalled();
  });

  it('should preserve payload user_id when no userId param provided', async () => {
    const events = [
      { action: 'page-view', payload: { user_id: 'event-user', path: '/home' } },
    ];

    await useCase.execute({ events }, 'session-1');

    const pageViews = analyticsRepo.insertPageViews.mock.calls[0][0];
    expect(pageViews[0].user_id).toBe('event-user');
  });

  it('should override payload user_id when userId param is provided', async () => {
    const events = [
      { action: 'page-view', payload: { user_id: 'event-user', path: '/home' } },
    ];

    await useCase.execute({ events }, 'session-1', 'override-user');

    const pageViews = analyticsRepo.insertPageViews.mock.calls[0][0];
    expect(pageViews[0].user_id).toBe('override-user');
  });
});
