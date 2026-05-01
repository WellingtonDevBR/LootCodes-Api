import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { ListNotificationsUseCase } from '../../core/use-cases/notifications/list-notifications.use-case.js';
import type { GetUnreadCountUseCase } from '../../core/use-cases/notifications/get-unread-count.use-case.js';
import type { MarkReadUseCase } from '../../core/use-cases/notifications/mark-read.use-case.js';
import type { MarkAllReadUseCase } from '../../core/use-cases/notifications/mark-all-read.use-case.js';
import type { GetPreferencesUseCase } from '../../core/use-cases/notifications/get-preferences.use-case.js';
import type { UpdatePreferencesUseCase } from '../../core/use-cases/notifications/update-preferences.use-case.js';
import type { RegisterPushTokenUseCase } from '../../core/use-cases/notifications/register-push-token.use-case.js';
import type { RemovePushTokenUseCase } from '../../core/use-cases/notifications/remove-push-token.use-case.js';
import type { UpdatePreferencesDto } from '../../core/use-cases/notifications/notification.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  listNotificationsQuerySchema,
  markReadParamsSchema,
  updatePreferencesSchema,
  registerPushTokenSchema,
  removePushTokenSchema,
} from '../schemas/notifications.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function notificationsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/',
    { preHandler: [authGuard], schema: { querystring: listNotificationsQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<ListNotificationsUseCase>(UC_TOKENS.ListNotifications);
      const notifications = await uc.execute(authUser.id, request.query.limit, request.query.offset);
      return reply.send(notifications);
    },
  );

  app.get('/unread-count', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const uc = container.resolve<GetUnreadCountUseCase>(UC_TOKENS.GetUnreadCount);
    const count = await uc.execute(authUser.id);
    return reply.send({ count });
  });

  app.put<{ Params: { id: string } }>(
    '/:id/read',
    { preHandler: [authGuard], schema: { params: markReadParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<MarkReadUseCase>(UC_TOKENS.MarkRead);
      await uc.execute(authUser.id, request.params.id);
      return reply.send({ success: true });
    },
  );

  app.put('/read-all', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const uc = container.resolve<MarkAllReadUseCase>(UC_TOKENS.MarkAllRead);
    await uc.execute(authUser.id);
    return reply.send({ success: true });
  });

  app.get('/preferences', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const uc = container.resolve<GetPreferencesUseCase>(UC_TOKENS.GetPreferences);
    const prefs = await uc.execute(authUser.id);
    return reply.send(prefs);
  });

  app.put<{ Body: UpdatePreferencesDto }>(
    '/preferences',
    { preHandler: [authGuard], schema: { body: updatePreferencesSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<UpdatePreferencesUseCase>(UC_TOKENS.UpdatePreferences);
      const prefs = await uc.execute(authUser.id, request.body);
      return reply.send(prefs);
    },
  );

  app.post<{ Body: { token: string; platform: 'web' | 'ios' | 'android' } }>(
    '/push-tokens',
    { preHandler: [authGuard], schema: { body: registerPushTokenSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<RegisterPushTokenUseCase>(UC_TOKENS.RegisterPushToken);
      await uc.execute(authUser.id, request.body.token, request.body.platform);
      return reply.send({ success: true });
    },
  );

  app.delete<{ Body: { token: string } }>(
    '/push-tokens',
    { preHandler: [authGuard], schema: { body: removePushTokenSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<RemovePushTokenUseCase>(UC_TOKENS.RemovePushToken);
      await uc.execute(authUser.id, request.body.token);
      return reply.send({ success: true });
    },
  );
}
