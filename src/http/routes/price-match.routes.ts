import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IPriceMatchService } from '../../core/ports/price-match-service.port.js';
import type { PriceMatchClaimSubmission } from '../../core/services/price-match/price-match.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { submitClaimBodySchema, claimIdParamsSchema } from '../schemas/price-match.schema.js';

interface AuthUser {
  id: string;
  email?: string;
}

function getAuthUser(request: unknown): AuthUser {
  return (request as Record<string, unknown>).authUser as AuthUser;
}

function tryGetAuthUser(request: unknown): AuthUser | undefined {
  return (request as Record<string, unknown>).authUser as AuthUser | undefined;
}

async function optionalAuthGuard(request: unknown, reply: unknown) {
  try {
    await authGuard(
      request as Parameters<typeof authGuard>[0],
      reply as Parameters<typeof authGuard>[1],
    );
  } catch {
    // Auth is optional — continue without user
  }
}

export async function priceMatchRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<IPriceMatchService>(TOKENS.PriceMatchService);

  app.post<{ Body: Omit<PriceMatchClaimSubmission, 'user_id'> }>(
    '/claim',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: submitClaimBodySchema },
    },
    async (request, reply) => {
      const user = tryGetAuthUser(request);
      const submission: PriceMatchClaimSubmission = {
        ...request.body,
        user_id: user?.id ?? null,
        guest_email: request.body.guest_email ?? null,
      };

      const result = await resolveService().submitClaim(submission, request.ip);
      return reply.code(201).send(result);
    },
  );

  app.get(
    '/claims',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const user = getAuthUser(request);
      const claims = await resolveService().getUserClaims(user.id);
      return reply.send({ claims });
    },
  );

  app.get(
    '/config',
    async (_request, reply) => {
      const config = await resolveService().getConfig();
      return reply.send(config ?? { enabled: false });
    },
  );

  app.get<{ Params: { id: string } }>(
    '/claims/:id/promo',
    {
      preHandler: [authGuard],
      schema: { params: claimIdParamsSchema },
    },
    async (request, reply) => {
      const user = getAuthUser(request);
      const code = await resolveService().getClaimPromoCode(user.id, request.params.id);
      return reply.send({ code });
    },
  );
}
