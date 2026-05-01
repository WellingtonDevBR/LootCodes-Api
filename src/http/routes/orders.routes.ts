import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IOrderService } from '../../core/ports/order-service.port.js';
import type { IKeyDeliveryService } from '../../core/ports/key-delivery-service.port.js';
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
      const orderService = container.resolve<IOrderService>(TOKENS.OrderService);
      const user = getAuthUser(request);
      const { limit, offset } = request.query;

      const orders = await orderService.getUserOrders(user.id, { limit, offset });
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
      const orderService = container.resolve<IOrderService>(TOKENS.OrderService);
      const user = getAuthUser(request);

      const detail = await orderService.getOrderDetail(request.params.id, user.id);
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
      const keyService = container.resolve<IKeyDeliveryService>(TOKENS.KeyDeliveryService);
      const user = getAuthUser(request);

      const keys = await keyService.getKeysForOrder(request.params.id, user.id);
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
      const keyService = container.resolve<IKeyDeliveryService>(TOKENS.KeyDeliveryService);
      const user = getAuthUser(request);

      const keys = await keyService.getKeysForOrderItem(request.params.itemId, user.id);
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
      const keyService = container.resolve<IKeyDeliveryService>(TOKENS.KeyDeliveryService);
      const user = getAuthUser(request);
      const reqCtx = buildRequestContext(request);

      const decryptedKey = await keyService.revealKey(
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
      const keyService = container.resolve<IKeyDeliveryService>(TOKENS.KeyDeliveryService);
      const user = getAuthUser(request);

      const viewed = await keyService.checkKeyViewed(
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
      const orderService = container.resolve<IOrderService>(TOKENS.OrderService);
      const { token, order_id } = request.body;

      const valid = await orderService.validateAccessToken(token, order_id);
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
      const orderService = container.resolve<IOrderService>(TOKENS.OrderService);
      const user = getAuthUser(request);

      await orderService.claimGuestOrder(request.body.token, user.id);
      return reply.send({ success: true });
    },
  );
}
