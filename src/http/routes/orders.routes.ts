import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../di/tokens.js';
import type { GetOrderUseCase } from '../../core/use-cases/orders/get-order.use-case.js';
import type { GetOrderDetailUseCase } from '../../core/use-cases/orders/get-order-detail.use-case.js';
import type { GetUserOrdersUseCase } from '../../core/use-cases/orders/get-user-orders.use-case.js';
import type { ValidateAccessTokenUseCase } from '../../core/use-cases/orders/validate-access-token.use-case.js';
import type { ClaimGuestOrderUseCase } from '../../core/use-cases/orders/claim-guest-order.use-case.js';
import type { GetKeysForOrderUseCase } from '../../core/use-cases/key-delivery/get-keys-for-order.use-case.js';
import type { GetKeysForOrderItemUseCase } from '../../core/use-cases/key-delivery/get-keys-for-order-item.use-case.js';
import type { RevealKeyUseCase } from '../../core/use-cases/key-delivery/reveal-key.use-case.js';
import type { CheckKeyViewedUseCase } from '../../core/use-cases/key-delivery/check-key-viewed.use-case.js';
import type { IProductKeyRepository } from '../../core/ports/product-key-repository.port.js';
import { authGuard } from '../middleware/auth.guard.js';
import { buildRequestContext } from '../middleware/request-context.js';
import {
  getOrdersQuerySchema,
  orderIdParamsSchema,
  itemIdParamsSchema,
  keyIdParamsSchema,
  revealKeyBodySchema,
  checkKeyViewedQuerySchema,
  validateAccessTokenBodySchema,
  claimGuestOrderBodySchema,
  logKeyViewBodySchema,
  logAccessAttemptBodySchema,
} from '../schemas/orders.schema.js';

interface AuthUser {
  id: string;
  email?: string;
}

function getAuthUser(request: unknown): AuthUser {
  return (request as Record<string, unknown>).authUser as AuthUser;
}

export async function orderRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/',
    {
      preHandler: [authGuard],
      schema: { querystring: getOrdersQuerySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetUserOrdersUseCase>(UC_TOKENS.GetUserOrders);
      const user = getAuthUser(request);
      const { limit, offset } = request.query;

      const orders = await uc.execute(user.id, { limit, offset });
      return reply.send({ orders });
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authGuard],
      schema: { params: orderIdParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetOrderDetailUseCase>(UC_TOKENS.GetOrderDetail);
      const user = getAuthUser(request);

      const detail = await uc.execute(request.params.id, user.id);
      return reply.send(detail);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id/keys',
    {
      preHandler: [authGuard],
      schema: { params: orderIdParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetKeysForOrderUseCase>(UC_TOKENS.GetKeysForOrder);
      const user = getAuthUser(request);

      const keys = await uc.execute(request.params.id, user.id);
      return reply.send({ keys });
    },
  );

  app.get<{ Params: { itemId: string } }>(
    '/items/:itemId/keys',
    {
      preHandler: [authGuard],
      schema: { params: itemIdParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetKeysForOrderItemUseCase>(UC_TOKENS.GetKeysForOrderItem);
      const user = getAuthUser(request);

      const keys = await uc.execute(request.params.itemId, user.id);
      return reply.send({ keys });
    },
  );

  app.post<{ Params: { keyId: string }; Body: { order_id: string } }>(
    '/keys/:keyId/reveal',
    {
      preHandler: [authGuard],
      schema: { params: keyIdParamsSchema, body: revealKeyBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<RevealKeyUseCase>(UC_TOKENS.RevealKey);
      const user = getAuthUser(request);
      const reqCtx = buildRequestContext(request);

      const decryptedKey = await uc.execute(
        request.params.keyId,
        request.body.order_id,
        user.id,
        reqCtx.clientIP,
        reqCtx.userAgent ?? 'unknown',
      );

      return reply.send({ key: decryptedKey });
    },
  );

  app.get<{ Params: { keyId: string }; Querystring: { order_id: string } }>(
    '/keys/:keyId/viewed',
    {
      preHandler: [authGuard],
      schema: { params: keyIdParamsSchema, querystring: checkKeyViewedQuerySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<CheckKeyViewedUseCase>(UC_TOKENS.CheckKeyViewed);
      const user = getAuthUser(request);

      const viewed = await uc.execute(
        request.params.keyId,
        request.query.order_id,
        user.id,
      );

      return reply.send({ viewed });
    },
  );

  app.post<{ Body: { token: string; order_id: string } }>(
    '/access/validate',
    {
      schema: { body: validateAccessTokenBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<ValidateAccessTokenUseCase>(UC_TOKENS.ValidateAccessToken);
      const { token, order_id } = request.body;

      const valid = await uc.execute(token, order_id);
      return reply.send({ valid });
    },
  );

  app.post<{ Body: { token: string } }>(
    '/access/claim',
    {
      preHandler: [authGuard],
      schema: { body: claimGuestOrderBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<ClaimGuestOrderUseCase>(UC_TOKENS.ClaimGuestOrder);
      const user = getAuthUser(request);

      await uc.execute(request.body.token, user.id);
      return reply.send({ success: true });
    },
  );

  app.post<{ Params: { keyId: string }; Body: { order_id: string; access_token?: string } }>(
    '/keys/:keyId/log-view',
    {
      preHandler: [authGuard],
      schema: { params: keyIdParamsSchema, body: logKeyViewBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<RevealKeyUseCase>(UC_TOKENS.RevealKey);
      const user = getAuthUser(request);
      const reqCtx = buildRequestContext(request);

      await uc.execute(
        request.params.keyId,
        request.body.order_id,
        user.id,
        reqCtx.clientIP,
        reqCtx.userAgent ?? 'unknown',
      );

      return reply.send({ success: true });
    },
  );

  app.post<{ Body: { token?: string; order_id?: string; email?: string; success: boolean; failure_reason?: string } }>(
    '/access/log-attempt',
    {
      schema: { body: logAccessAttemptBodySchema },
    },
    async (request, reply) => {
      const productKeyRepo = container.resolve<IProductKeyRepository>(TOKENS.ProductKeyRepository);

      await productKeyRepo.logAccessAttempt({
        token: request.body.token,
        order_id: request.body.order_id,
        email: request.body.email,
        success: request.body.success,
        failure_reason: request.body.failure_reason,
      });

      return reply.send({ success: true });
    },
  );
}
