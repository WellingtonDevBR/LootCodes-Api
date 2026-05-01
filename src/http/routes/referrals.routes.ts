import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetReferralMeUseCase } from '../../core/use-cases/referrals/get-referral-me.use-case.js';
import type { ListReferralsUseCase } from '../../core/use-cases/referrals/list-referrals.use-case.js';
import type { GetLeaderboardUseCase } from '../../core/use-cases/referrals/get-leaderboard.use-case.js';
import type { OpenDisputeUseCase } from '../../core/use-cases/referrals/open-dispute.use-case.js';
import type { ListReferralsParams, GetLeaderboardParams, OpenDisputeParams } from '../../core/use-cases/referrals/referral.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  listReferralsQuerySchema,
  leaderboardQuerySchema,
  openDisputeBodySchema,
} from '../schemas/referrals.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function referralRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<GetReferralMeUseCase>(UC_TOKENS.GetReferralMe);
      const me = await uc.execute(authUser.id);
      return reply.send(me);
    },
  );

  app.get<{ Querystring: ListReferralsParams }>(
    '/',
    { preHandler: [authGuard], schema: { querystring: listReferralsQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<ListReferralsUseCase>(UC_TOKENS.ListReferrals);
      const page = await uc.execute(authUser.id, request.query);
      return reply.send(page);
    },
  );

  app.get<{ Querystring: GetLeaderboardParams }>(
    '/leaderboard',
    { schema: { querystring: leaderboardQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetLeaderboardUseCase>(UC_TOKENS.GetLeaderboard);
      const leaderboard = await uc.execute(request.query);
      return reply.send(leaderboard);
    },
  );

  app.post<{ Body: OpenDisputeParams }>(
    '/disputes',
    { preHandler: [authGuard], schema: { body: openDisputeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<OpenDisputeUseCase>(UC_TOKENS.OpenDispute);
      const result = await uc.execute(authUser.id, request.body);
      return reply.send(result);
    },
  );
}
