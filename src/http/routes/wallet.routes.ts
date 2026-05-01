import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetBalanceUseCase } from '../../core/use-cases/wallet/get-balance.use-case.js';
import type { ListLedgerUseCase } from '../../core/use-cases/wallet/list-ledger.use-case.js';
import type { GetOrderEarningsUseCase } from '../../core/use-cases/wallet/get-order-earnings.use-case.js';
import type { ClaimReviewRewardUseCase } from '../../core/use-cases/wallet/claim-review-reward.use-case.js';
import type { LedgerPaginationParams } from '../../core/use-cases/wallet/wallet.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { ledgerQuerySchema, orderEarningsBodySchema } from '../schemas/wallet.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function walletRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<GetBalanceUseCase>(UC_TOKENS.GetBalance);
      const balance = await uc.execute(authUser.id);
      return reply.send(balance);
    },
  );

  app.get<{ Querystring: LedgerPaginationParams }>(
    '/ledger',
    { preHandler: [authGuard], schema: { querystring: ledgerQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<ListLedgerUseCase>(UC_TOKENS.ListLedger);
      const result = await uc.execute(authUser.id, request.query);
      return reply.send(result);
    },
  );

  app.post<{ Body: { order_ids: string[] } }>(
    '/order-earnings',
    { preHandler: [authGuard], schema: { body: orderEarningsBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<GetOrderEarningsUseCase>(UC_TOKENS.GetOrderEarnings);
      const earnings = await uc.execute(authUser.id, request.body.order_ids);
      return reply.send(earnings);
    },
  );

  app.post<{ Body: { review_id: string } }>(
    '/claim-review-reward',
    {
      preHandler: [authGuard],
      schema: {
        body: {
          type: 'object',
          required: ['review_id'],
          properties: {
            review_id: { type: 'string', format: 'uuid' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<ClaimReviewRewardUseCase>(UC_TOKENS.ClaimReviewReward);
      const result = await uc.execute(authUser.id, request.body.review_id);
      return reply.send(result);
    },
  );
}
