import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Product Routes', () => {
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

  describe('GET /products/slug/:slug', () => {
    it('should return 404 for a nonexistent product slug', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/products/slug/nonexistent-game',
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should return product data for an existing slug', async () => {
      mocks.productRepo.products.push({
        id: 'prod-1',
        slug: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        status: 'active',
        created_at: new Date().toISOString(),
      });
      mocks.productRepo.variants.push({
        id: 'var-1',
        product_id: 'prod-1',
        name: 'Standard Edition',
        price_cents: 2999,
        currency: 'USD',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/products/slug/test-game',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.product.slug).toBe('test-game');
      expect(body.variants).toHaveLength(1);
    });
  });

  describe('GET /products/platforms', () => {
    it('should return a list of platforms', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/products/platforms',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).toHaveProperty('code');
    });
  });

  describe('GET /products/regions', () => {
    it('should return a list of regions', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/products/regions',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).toHaveProperty('code');
    });
  });

  describe('GET /products/featured', () => {
    it('should return an empty array when no featured products exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/products/featured',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });
  });

  describe('GET /products/genres', () => {
    it('should return a list of genres', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/products/genres',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].name).toBe('Action');
    });
  });
});
