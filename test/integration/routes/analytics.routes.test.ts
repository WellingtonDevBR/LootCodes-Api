import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../src/di/tokens.js';

describe('Analytics Routes', () => {
  let app: FastifyInstance;
  let mockBatchExecute: ReturnType<typeof vi.fn>;
  let mockGeoExecute: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockBatchExecute = vi.fn().mockResolvedValue(3);
    mockGeoExecute = vi.fn().mockResolvedValue({
      country_code: 'US',
      country_name: 'United States',
      city: 'New York',
      is_vpn: false,
    });

    container.register(UC_TOKENS.TrackBatch, { useValue: { execute: mockBatchExecute } });
    container.register(UC_TOKENS.Geolocate, { useValue: { execute: mockGeoExecute } });
    container.register(UC_TOKENS.TrackCartEvent, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.UpdateSessionOutcome, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.TrackProductViewDuration, { useValue: { execute: vi.fn() } });
    container.register(UC_TOKENS.TrackSearchEvent, { useValue: { execute: vi.fn() } });

    app = Fastify({ logger: false });

    const { analyticsRoutes } = await import('../../../src/http/routes/analytics.routes.js');
    await app.register(async (instance) => {
      await analyticsRoutes(instance);
    }, { prefix: '/analytics' });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    container.clearInstances();
  });

  describe('POST /analytics/batch', () => {
    it('accepts envelope-format batch with action+payload events', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/analytics/batch',
        payload: {
          session_id: 'sess-001',
          events: [
            { action: 'page-view', payload: { path: '/home' } },
            { action: 'activity-event', payload: { event_type: 'click' } },
            { action: 'session-upsert', payload: { device_type: 'mobile' } },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.processed).toBe(3);

      expect(mockBatchExecute).toHaveBeenCalledWith(
        {
          events: [
            { action: 'page-view', payload: { path: '/home' } },
            { action: 'activity-event', payload: { event_type: 'click' } },
            { action: 'session-upsert', payload: { device_type: 'mobile' } },
          ],
        },
        'sess-001',
        undefined,
      );
    });

    it('rejects batch without events', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/analytics/batch',
        payload: { session_id: 'sess-001' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects events with missing action field', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/analytics/batch',
        payload: {
          session_id: 'sess-001',
          events: [{ payload: { path: '/home' } }],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /analytics/geolocation', () => {
    it('returns geo data for client IP', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/analytics/geolocation',
        headers: { 'x-forwarded-for': '8.8.8.8' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.country_code).toBe('US');
      expect(body.country_name).toBe('United States');
      expect(body.is_vpn).toBe(false);
    });
  });
});
