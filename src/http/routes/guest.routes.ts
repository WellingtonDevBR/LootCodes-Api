import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IGuestAccessService } from '../../core/ports/guest-access-service.port.js';
import type { IGuestSessionRepository } from '../../core/ports/guest-session.port.js';
import type { CreateTicketDto } from '../../core/services/support/support.types.js';
import { AuthenticationError } from '../../core/errors/domain-errors.js';
import { buildRequestContext } from '../middleware/request-context.js';
import {
  guestOrderParamsSchema,
  guestRevealKeyBodySchema,
  guestCreateTicketBodySchema,
  guestSessionExchangeBodySchema,
} from '../schemas/guest.schema.js';

function extractGuestToken(request: FastifyRequest): string {
  const headerToken = request.headers['x-guest-token'];
  if (typeof headerToken === 'string' && headerToken.length > 0) {
    return headerToken;
  }

  const cookies = request.headers.cookie;
  if (cookies) {
    const match = cookies.split(';').find((c) => c.trim().startsWith('guest_session='));
    if (match) {
      const value = match.split('=')[1]?.trim();
      if (value && value.length > 0) {
        return value;
      }
    }
  }

  throw new AuthenticationError('Missing guest session token');
}

export async function guestRoutes(app: FastifyInstance) {
  app.post<{ Body: { token: string } }>(
    '/session',
    {
      schema: { body: guestSessionExchangeBodySchema },
    },
    async (request, reply) => {
      const guestSessionRepo = container.resolve<IGuestSessionRepository>(TOKENS.GuestSessionRepository);
      const session = await guestSessionRepo.exchangeToken(request.body.token);

      if (!session) {
        throw new AuthenticationError('Invalid or expired guest token');
      }

      return reply.send({
        email: session.email,
        order_id: session.order_id,
        expires_at: session.expires_at,
      });
    },
  );

  app.get<{ Params: { orderId: string } }>(
    '/orders/:orderId',
    {
      schema: { params: guestOrderParamsSchema },
    },
    async (request, reply) => {
      const guestService = container.resolve<IGuestAccessService>(TOKENS.GuestAccessService);
      const token = extractGuestToken(request);

      const detail = await guestService.getGuestOrder(token, request.params.orderId);
      return reply.send(detail);
    },
  );

  app.get<{ Params: { orderId: string } }>(
    '/orders/:orderId/keys',
    {
      schema: { params: guestOrderParamsSchema },
    },
    async (request, reply) => {
      const guestService = container.resolve<IGuestAccessService>(TOKENS.GuestAccessService);
      const token = extractGuestToken(request);

      const keys = await guestService.getGuestOrderKeys(token, request.params.orderId);
      return reply.send({ keys });
    },
  );

  app.post<{ Body: { order_id: string; key_id: string } }>(
    '/keys/reveal',
    {
      schema: { body: guestRevealKeyBodySchema },
    },
    async (request, reply) => {
      const guestService = container.resolve<IGuestAccessService>(TOKENS.GuestAccessService);
      const token = extractGuestToken(request);
      const reqCtx = buildRequestContext(request);

      const decryptedKey = await guestService.revealGuestKey(
        token,
        request.body.order_id,
        request.body.key_id,
        reqCtx.clientIP,
        reqCtx.userAgent ?? 'unknown',
      );

      return reply.send({ key: decryptedKey });
    },
  );

  app.post<{ Body: CreateTicketDto }>(
    '/support-tickets',
    {
      schema: { body: guestCreateTicketBodySchema },
    },
    async (request, reply) => {
      const guestService = container.resolve<IGuestAccessService>(TOKENS.GuestAccessService);
      const token = extractGuestToken(request);

      const ticket = await guestService.createGuestSupportTicket(token, request.body);
      return reply.code(201).send(ticket);
    },
  );
}
