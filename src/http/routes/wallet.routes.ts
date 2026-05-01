import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IWalletService } from '../../core/ports/wallet-service.port.js';
import type { LedgerPaginationParams } from '../../core/services/wallet/wallet.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { ledgerQuerySchema, orderEarningsBodySchema } from '../schemas/wallet.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function walletRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<IWalletService>(TOKENS.WalletService);

  app.get(
    '/',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const balance = await resolveService().getBalance(authUser.id);
      return reply.send(balance);
    },
  );

  app.get<{ Querystring: LedgerPaginationParams }>(
    '/ledger',
    { preHandler: [authGuard], schema: { querystring: ledgerQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const result = await resolveService().listLedger(authUser.id, request.query);
      return reply.send(result);
    },
  );

  app.post<{ Body: { order_ids: string[] } }>(
    '/order-earnings',
    { preHandler: [authGuard], schema: { body: orderEarningsBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const earnings = await resolveService().getOrderEarnings(authUser.id, request.body.order_ids);
      return reply.send(earnings);
    },
  );
}
