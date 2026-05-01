import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IAnalyticsService } from '../../core/ports/analytics-service.port.js';
import type { CartEvent, SessionOutcomeDto } from '../../core/services/analytics/analytics.types.js';
import {
  batchEventsBodySchema,
  cartEventBodySchema,
  sessionOutcomeBodySchema,
} from '../schemas/analytics.schema.js';

interface OptionalAuthRequest {
  authUser?: { id: string; email?: string };
}

export async function analyticsRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<IAnalyticsService>(TOKENS.AnalyticsService);

  app.post<{ Body: { session_id: string; events: unknown[] } }>(
    '/batch',
    { schema: { body: batchEventsBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as OptionalAuthRequest;
      const { session_id, events } = request.body;
      await resolveService().trackBatch(
        { events: events as never[] },
        session_id,
        authUser?.id,
      );
      return reply.code(204).send();
    },
  );

  app.post<{ Body: CartEvent }>(
    '/cart-event',
    { schema: { body: cartEventBodySchema } },
    async (request, reply) => {
      await resolveService().trackCartEvent(request.body);
      return reply.code(204).send();
    },
  );

  app.post<{ Body: SessionOutcomeDto }>(
    '/session-outcome',
    { schema: { body: sessionOutcomeBodySchema } },
    async (request, reply) => {
      await resolveService().updateSessionOutcome(request.body);
      return reply.code(204).send();
    },
  );

  app.get('/geolocation', async (request, reply) => {
    const ip = request.ip || 'unknown';
    const result = await resolveService().geolocate(ip);
    return reply.send(result);
  });
}
