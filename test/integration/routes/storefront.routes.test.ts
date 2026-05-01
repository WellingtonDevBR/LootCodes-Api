import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Storefront Routes', () => {
  let app: FastifyInstance;
  let mocks: TestMocks;

  beforeEach(async () => {
    const testApp = await buildTestApp();
    app = testApp.app;
    mocks = testApp.mocks;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/storefront/visitor-country', () => {
    it('should return country info from geo service', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/storefront/visitor-country',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.country_code).toBe('US');
      expect(body.country_name).toBe('United States');
    });
  });

  describe('GET /api/storefront/currency', () => {
    it('should return currency based on visitor country', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/storefront/currency',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.currency).toBe('USD');
      expect(body.country_code).toBe('US');
    });
  });

  describe('POST /api/storefront/cart/convert', () => {
    it('should return converted prices for valid variant IDs', async () => {
      const variantId = '550e8400-e29b-41d4-a716-446655440000';

      const res = await app.inject({
        method: 'POST',
        url: '/api/storefront/cart/convert',
        payload: {
          variant_ids: [variantId],
          currency: 'EUR',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.prices).toBeDefined();
    });

    it('should return 400 when variant_ids is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/storefront/cart/convert',
        payload: { currency: 'EUR' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when currency is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/storefront/cart/convert',
        payload: { variant_ids: ['550e8400-e29b-41d4-a716-446655440000'] },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when variant_ids is empty', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/storefront/cart/convert',
        payload: { variant_ids: [], currency: 'EUR' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/storefront/promo-header', () => {
    it('should return null when no active promo exists', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/storefront/promo-header',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body).toBeNull();
    });
  });

  describe('GET /api/storefront/trustpilot', () => {
    it('should return trustpilot data or null', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/storefront/trustpilot',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body).toBeNull();
    });
  });
});
