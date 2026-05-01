import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IReferralService } from '../../core/ports/referral-service.port.js';
import type { ListReferralsParams, GetLeaderboardParams, OpenDisputeParams } from '../../core/services/referrals/referral.types.js';
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
  const resolveService = () => container.resolve<IReferralService>(TOKENS.ReferralService);

  app.get(
    '/me',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const me = await resolveService().getMe(authUser.id);
      return reply.send(me);
    },
  );

  app.get<{ Querystring: ListReferralsParams }>(
    '/',
    { preHandler: [authGuard], schema: { querystring: listReferralsQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const page = await resolveService().listReferrals(authUser.id, request.query);
      return reply.send(page);
    },
  );

  app.get<{ Querystring: GetLeaderboardParams }>(
    '/leaderboard',
    { schema: { querystring: leaderboardQuerySchema } },
    async (request, reply) => {
      const leaderboard = await resolveService().getLeaderboard(request.query);
      return reply.send(leaderboard);
    },
  );

  app.post<{ Body: OpenDisputeParams }>(
    '/dispute',
    { preHandler: [authGuard], schema: { body: openDisputeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const result = await resolveService().openDispute(authUser.id, request.body);
      return reply.send(result);
    },
  );
}
