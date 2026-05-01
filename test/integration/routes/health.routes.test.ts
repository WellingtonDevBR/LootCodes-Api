import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Health Routes', () => {
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

  describe('GET /health', () => {
    it('should return ok status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready when database is reachable', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('ready');
      expect(body.timestamp).toBeDefined();
    });

    it('should return 503 when database query fails', async () => {
      mocks.db.queryOne = async () => {
        throw new Error('connection refused');
      };

      const res = await app.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(res.statusCode).toBe(503);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('not_ready');
    });
  });
});
