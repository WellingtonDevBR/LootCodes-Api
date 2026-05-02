import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { TrackBatchUseCase } from '../../core/use-cases/analytics/track-batch.use-case.js';
import type { TrackCartEventUseCase } from '../../core/use-cases/analytics/track-cart-event.use-case.js';
import type { UpdateSessionOutcomeUseCase } from '../../core/use-cases/analytics/update-session-outcome.use-case.js';
import type { TrackProductViewDurationUseCase } from '../../core/use-cases/analytics/track-product-view-duration.use-case.js';
import type { TrackSearchEventUseCase } from '../../core/use-cases/analytics/track-search-event.use-case.js';
import type { GeolocateUseCase } from '../../core/use-cases/analytics/geolocate.use-case.js';
import type { CartEvent, SessionOutcomeDto, ProductViewDurationDto, SearchEventDto, BatchedEventEnvelope, SessionUpsertDto } from '../../core/use-cases/analytics/analytics.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import {
  batchEventsBodySchema,
  cartEventBodySchema,
  sessionOutcomeBodySchema,
} from '../schemas/analytics.schema.js';

interface OptionalAuthRequest {
  authUser?: { id: string; email?: string };
}

export async function analyticsRoutes(app: FastifyInstance) {
  app.post<{ Body: { session_id: string; events: BatchedEventEnvelope[] } }>(
    '/batch',
    { schema: { body: batchEventsBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as OptionalAuthRequest;
      const { session_id, events } = request.body;
      const uc = container.resolve<TrackBatchUseCase>(UC_TOKENS.TrackBatch);
      const processed = await uc.execute({ events }, session_id, authUser?.id);
      return reply.send({ success: true, processed });
    },
  );

  app.post<{ Body: CartEvent }>(
    '/cart-event',
    { schema: { body: cartEventBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<TrackCartEventUseCase>(UC_TOKENS.TrackCartEvent);
      await uc.execute(request.body);
      return reply.code(204).send();
    },
  );

  app.post<{ Body: SessionOutcomeDto }>(
    '/session-outcome',
    { schema: { body: sessionOutcomeBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<UpdateSessionOutcomeUseCase>(UC_TOKENS.UpdateSessionOutcome);
      await uc.execute(request.body);
      return reply.code(204).send();
    },
  );

  app.post<{ Body: ProductViewDurationDto }>(
    '/product-view-duration',
    {
      schema: {
        body: {
          type: 'object',
          required: ['session_id', 'product_id', 'duration_seconds'],
          properties: {
            session_id: { type: 'string', minLength: 1 },
            product_id: { type: 'string', format: 'uuid' },
            variant_id: { type: 'string', format: 'uuid' },
            duration_seconds: { type: 'number', minimum: 0 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { authUser } = request as unknown as OptionalAuthRequest;
      const uc = container.resolve<TrackProductViewDurationUseCase>(UC_TOKENS.TrackProductViewDuration);
      await uc.execute(request.body, authUser?.id);
      return reply.code(204).send();
    },
  );

  app.post<{ Body: SearchEventDto }>(
    '/search',
    {
      schema: {
        body: {
          type: 'object',
          required: ['session_id', 'query', 'results_count'],
          properties: {
            session_id: { type: 'string', minLength: 1 },
            query: { type: 'string', maxLength: 500 },
            results_count: { type: 'integer', minimum: 0 },
            filters: { type: 'object' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const uc = container.resolve<TrackSearchEventUseCase>(UC_TOKENS.TrackSearchEvent);
      await uc.execute(request.body);
      return reply.code(204).send();
    },
  );

  app.post(
    '/geolocation',
    async (request, reply) => {
      const reqCtx = buildRequestContext(request);
      const uc = container.resolve<GeolocateUseCase>(UC_TOKENS.Geolocate);
      const result = await uc.execute(reqCtx.clientIP);
      return reply.send(result);
    },
  );

  app.post<{ Body: SessionUpsertDto }>(
    '/session-upsert',
    {
      schema: {
        body: {
          type: 'object',
          required: ['session_id'],
          properties: {
            session_id: { type: 'string', minLength: 1 },
            user_id: { type: 'string' },
            page_path: { type: 'string' },
            referrer: { type: 'string' },
            traffic_source: { type: 'string' },
            utm_source: { type: 'string' },
            utm_medium: { type: 'string' },
            utm_campaign: { type: 'string' },
            device_type: { type: 'string' },
            browser: { type: 'string' },
            os: { type: 'string' },
            screen_resolution: { type: 'string' },
            language: { type: 'string' },
            country_code: { type: 'string' },
            user_agent: { type: 'string' },
            merge_anonymous: { type: 'boolean' },
            auto_consolidate: { type: 'boolean' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const uc = container.resolve<TrackBatchUseCase>(UC_TOKENS.TrackBatch);
      const { session_id, user_id, ...rest } = request.body;
      await uc.execute(
        { events: [{ action: 'session-upsert', payload: { ...rest, session_id, user_id } }] },
        session_id,
        user_id,
      );
      return reply.code(204).send();
    },
  );
}
