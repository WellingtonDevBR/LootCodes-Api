import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IAnalyticsService } from '../../../../../src/core/ports/analytics-service.port.js';

describe('AnalyticsService', () => {
  let mocks: TestMocks;
  let service: IAnalyticsService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IAnalyticsService>(TOKENS.AnalyticsService);
  });

  describe('trackBatch', () => {
    it('should separate and insert page views and activity events', async () => {
      await service.trackBatch({
        events: [
          { session_id: 'sess-1', path: '/home' },
          { session_id: 'sess-1', event_type: 'click', element_id: 'btn-1' },
        ],
      }, 'sess-1', 'user-1');

      expect(mocks.analyticsRepo.pageViews.length).toBe(1);
      expect(mocks.analyticsRepo.activityEvents.length).toBe(1);
      expect(mocks.analyticsRepo.pageViews[0].path).toBe('/home');
      expect(mocks.analyticsRepo.activityEvents[0].event_type).toBe('click');
    });

    it('should enrich events with session and user ids', async () => {
      await service.trackBatch({
        events: [{ session_id: '', path: '/test' }],
      }, 'sess-1', 'user-1');

      expect(mocks.analyticsRepo.pageViews[0].session_id).toBe('sess-1');
      expect(mocks.analyticsRepo.pageViews[0].user_id).toBe('user-1');
    });
  });

  describe('trackCartEvent', () => {
    it('should track valid cart event', async () => {
      await service.trackCartEvent({
        session_id: 'sess-1',
        action: 'add',
        variant_id: 'var-1',
        quantity: 1,
      });
      expect(mocks.analyticsRepo.cartEvents.length).toBe(1);
    });

    it('should reject invalid action', async () => {
      await expect(service.trackCartEvent({
        session_id: 'sess-1',
        action: 'invalid' as 'add',
      })).rejects.toThrow('Invalid cart action');
    });
  });

  describe('updateSessionOutcome', () => {
    it('should update session outcome', async () => {
      await service.updateSessionOutcome({ session_id: 'sess-1', outcome: 'purchase', conversion_value: 2999 });
      expect(mocks.analyticsRepo.outcomes.length).toBe(1);
      expect(mocks.analyticsRepo.outcomes[0].outcome).toBe('purchase');
    });
  });

  describe('geolocate', () => {
    it('should return geo data', async () => {
      const result = await service.geolocate('1.2.3.4');
      expect(result.country_code).toBe('US');
    });
  });
});
