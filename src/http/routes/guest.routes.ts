import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../di/tokens.js';
import type { IGuestSessionRepository } from '../../core/ports/guest-session.port.js';
import type { GetGuestOrderUseCase } from '../../core/use-cases/guest/get-guest-order.use-case.js';
import type { GetGuestOrderKeysUseCase } from '../../core/use-cases/guest/get-guest-order-keys.use-case.js';
import type { RevealGuestKeyUseCase } from '../../core/use-cases/guest/reveal-guest-key.use-case.js';
import type { CreateGuestSupportTicketUseCase } from '../../core/use-cases/guest/create-guest-support-ticket.use-case.js';
import type { CreateTicketDto } from '../../core/use-cases/support/support.types.js';
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
  app.post<{ Body: { token: string; order_id?: string; email?: string } }>(
    '/session',
    { schema: { body: guestSessionExchangeBodySchema } },
    async (request, reply) => {
      const guestSessionRepo = container.resolve<IGuestSessionRepository>(TOKENS.GuestSessionRepository);
      const session = await guestSessionRepo.exchangeToken(request.body.token);

      if (!session) {
        throw new AuthenticationError('Invalid or expired guest token');
      }

      if (request.body.order_id && session.order_id !== request.body.order_id) {
        throw new AuthenticationError('Token does not match the provided order');
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
    { schema: { params: guestOrderParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetGuestOrderUseCase>(UC_TOKENS.GetGuestOrder);
      const token = extractGuestToken(request);
      const detail = await uc.execute(token, request.params.orderId);
      return reply.send(detail);
    },
  );

  app.get<{ Params: { orderId: string } }>(
    '/orders/:orderId/keys',
    { schema: { params: guestOrderParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetGuestOrderKeysUseCase>(UC_TOKENS.GetGuestOrderKeys);
      const token = extractGuestToken(request);
      const keys = await uc.execute(token, request.params.orderId);
      return reply.send({ keys });
    },
  );

  app.post<{ Body: { order_id: string; key_id: string } }>(
    '/keys/reveal',
    { schema: { body: guestRevealKeyBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<RevealGuestKeyUseCase>(UC_TOKENS.RevealGuestKey);
      const token = extractGuestToken(request);
      const reqCtx = buildRequestContext(request);
      const decryptedKey = await uc.execute(
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
    { schema: { body: guestCreateTicketBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<CreateGuestSupportTicketUseCase>(UC_TOKENS.CreateGuestSupportTicket);
      const token = extractGuestToken(request);
      const ticket = await uc.execute(token, request.body);
      return reply.code(201).send(ticket);
    },
  );
}
