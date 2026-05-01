import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { SubmitClaimUseCase } from '../../core/use-cases/price-match/submit-claim.use-case.js';
import type { GetUserClaimsUseCase } from '../../core/use-cases/price-match/get-user-claims.use-case.js';
import type { GetConfigUseCase } from '../../core/use-cases/price-match/get-config.use-case.js';
import type { GetClaimPromoCodeUseCase } from '../../core/use-cases/price-match/get-claim-promo-code.use-case.js';
import type { PriceMatchClaimSubmission } from '../../core/use-cases/price-match/price-match.types.js';
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
  app.post<{ Body: Omit<PriceMatchClaimSubmission, 'user_id'> }>(
    '/claim',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: submitClaimBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<SubmitClaimUseCase>(UC_TOKENS.SubmitClaim);
      const user = tryGetAuthUser(request);
      const submission: PriceMatchClaimSubmission = {
        ...request.body,
        user_id: user?.id ?? null,
        guest_email: request.body.guest_email ?? null,
      };
      const result = await uc.execute(submission, request.ip);
      return reply.code(201).send(result);
    },
  );

  app.get(
    '/claims',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const uc = container.resolve<GetUserClaimsUseCase>(UC_TOKENS.GetUserClaims);
      const user = getAuthUser(request);
      const claims = await uc.execute(user.id);
      return reply.send({ claims });
    },
  );

  app.get(
    '/config',
    async (_request, reply) => {
      const uc = container.resolve<GetConfigUseCase>(UC_TOKENS.GetPriceMatchConfig);
      const config = await uc.execute();
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
      const uc = container.resolve<GetClaimPromoCodeUseCase>(UC_TOKENS.GetClaimPromoCode);
      const user = getAuthUser(request);
      const code = await uc.execute(user.id, request.params.id);
      return reply.send({ code });
    },
  );
}
