import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS, TOKENS } from '../../di/tokens.js';
import type { GetOrderDetailUseCase } from '../../core/use-cases/orders/get-order-detail.use-case.js';
import type { GetUserOrdersUseCase } from '../../core/use-cases/orders/get-user-orders.use-case.js';
import type { ValidateAccessTokenUseCase } from '../../core/use-cases/orders/validate-access-token.use-case.js';
import type { GenerateAccessTokenUseCase } from '../../core/use-cases/orders/generate-access-token.use-case.js';
import type { RefreshAccessTokenUseCase } from '../../core/use-cases/orders/refresh-access-token.use-case.js';
import type { ClaimGuestOrderUseCase } from '../../core/use-cases/orders/claim-guest-order.use-case.js';
import type { LogAccessAttemptUseCase } from '../../core/use-cases/orders/log-access-attempt.use-case.js';
import type { GetKeysForOrderUseCase } from '../../core/use-cases/key-delivery/get-keys-for-order.use-case.js';
import type { GetKeysForOrderItemUseCase } from '../../core/use-cases/key-delivery/get-keys-for-order-item.use-case.js';
import type { RevealKeyUseCase } from '../../core/use-cases/key-delivery/reveal-key.use-case.js';
import type { CheckKeyViewedUseCase } from '../../core/use-cases/key-delivery/check-key-viewed.use-case.js';
import type { VerifyPaymentForAccessUseCase } from '../../core/use-cases/key-delivery/verify-payment-for-access.use-case.js';
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
  generateAccessTokenBodySchema,
  refreshAccessTokenBodySchema,
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
    '/:id/full',
    {
      preHandler: [authGuard],
      schema: { params: orderIdParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetOrderDetailUseCase>(UC_TOKENS.GetOrderDetail);
      const user = getAuthUser(request);

      const detail = await uc.executeFullAccess(request.params.id, user.id);
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

  app.post<{ Body: { order_id: string; email: string } }>(
    '/access/generate',
    {
      schema: { body: generateAccessTokenBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GenerateAccessTokenUseCase>(UC_TOKENS.GenerateAccessToken);
      const { order_id, email } = request.body;

      const accessToken = await uc.execute(order_id, email);
      return reply.send(accessToken);
    },
  );

  app.post<{ Body: { token: string } }>(
    '/access/refresh',
    {
      schema: { body: refreshAccessTokenBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<RefreshAccessTokenUseCase>(UC_TOKENS.RefreshAccessToken);

      const accessToken = await uc.execute(request.body.token);
      return reply.send(accessToken);
    },
  );

  app.post<{ Body: { token: string; order_id: string } }>(
    '/access/token-metadata',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token', 'order_id'],
          properties: {
            token: { type: 'string', minLength: 1 },
            order_id: { type: 'string', format: 'uuid' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const orderRepo = container.resolve<import('../../core/ports/order-repository.port.js').IOrderRepository>(TOKENS.OrderRepository);
      const metadata = await orderRepo.getOrderAccessTokenMetadata(request.body.token, request.body.order_id);
      if (!metadata) return reply.code(404).send({ error: 'Token not found' });
      return reply.send(metadata);
    },
  );

  app.post<{ Params: { keyId: string }; Body: { order_id: string; access_token?: string } }>(
    '/keys/:keyId/log-view',
    {
      schema: { params: keyIdParamsSchema, body: logKeyViewBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<RevealKeyUseCase>(UC_TOKENS.RevealKey);
      const user = (request as unknown as { authUser?: AuthUser }).authUser;
      const reqCtx = buildRequestContext(request);

      await uc.execute(
        request.params.keyId,
        request.body.order_id,
        user?.id ?? 'guest',
        reqCtx.clientIP,
        reqCtx.userAgent ?? 'unknown',
      );

      return reply.send({ success: true });
    },
  );

  app.post<{ Body: { order_id: string; access_token?: string; email?: string } }>(
    '/keys/verify-payment',
    {
      schema: {
        body: {
          type: 'object',
          required: ['order_id'],
          properties: {
            order_id: { type: 'string', format: 'uuid' },
            access_token: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const user = (request as unknown as { authUser?: AuthUser }).authUser;
      const uc = container.resolve<VerifyPaymentForAccessUseCase>(UC_TOKENS.VerifyPaymentForAccess);
      const result = await uc.execute({
        order_id: request.body.order_id,
        access_token: request.body.access_token,
        email: request.body.email,
        user_id: user?.id,
      });
      return reply.send(result);
    },
  );

  app.post<{ Body: { token?: string; order_id?: string; email?: string; success: boolean; failure_reason?: string } }>(
    '/access/log-attempt',
    {
      schema: { body: logAccessAttemptBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<LogAccessAttemptUseCase>(UC_TOKENS.LogAccessAttempt);
      await uc.execute(request.body);
      return reply.send({ success: true });
    },
  );

  app.post<{ Body: { order_id: string; key_ids: string[] } }>(
    '/key-view-logs',
    {
      preHandler: [authGuard],
      schema: {
        body: {
          type: 'object',
          required: ['order_id', 'key_ids'],
          properties: {
            order_id: { type: 'string', format: 'uuid' },
            key_ids: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              maxItems: 200,
            },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const orderRepo = container.resolve<import('../../core/ports/order-repository.port.js').IOrderRepository>(TOKENS.OrderRepository);
      const logs = await orderRepo.getKeyViewLogs(request.body.order_id, request.body.key_ids);
      return reply.send({ logs });
    },
  );
}
