import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, type TestMocks } from '../../helpers/test-app.js';

describe('Webhook Routes', () => {
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

  describe('POST /api/webhooks/stripe', () => {
    it('should return 400 when signature is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/webhooks/stripe',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({ id: 'evt_test', type: 'payment_intent.succeeded' }),
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should process a valid webhook with signature', async () => {
      const payload = JSON.stringify({
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test' } },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/webhooks/stripe',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'whsec_test_signature',
        },
        payload,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.processed).toBe(true);
      expect(body.event_id).toBeDefined();
      expect(body.action_taken).toBe('mock_action');
    });

    it('should record processed events in the webhook handler', async () => {
      const payload = JSON.stringify({
        id: 'evt_tracking_test',
        type: 'charge.succeeded',
        data: {},
      });

      await app.inject({
        method: 'POST',
        url: '/api/webhooks/stripe',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'sig_test',
        },
        payload,
      });

      expect(mocks.webhookHandler.results).toHaveLength(1);
      expect(mocks.webhookHandler.results[0].processed).toBe(true);
    });
  });
});
