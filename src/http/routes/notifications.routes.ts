import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { INotificationService } from '../../core/ports/notification-service.port.js';
import type { UpdatePreferencesDto } from '../../core/services/notifications/notification.types.js';
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
  const resolveService = () => container.resolve<INotificationService>(TOKENS.NotificationService);

  app.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/',
    { preHandler: [authGuard], schema: { querystring: listNotificationsQuerySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const notifications = await resolveService().listNotifications(
        authUser.id,
        request.query.limit,
        request.query.offset,
      );
      return reply.send(notifications);
    },
  );

  app.get('/unread-count', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const count = await resolveService().getUnreadCount(authUser.id);
    return reply.send({ count });
  });

  app.put<{ Params: { id: string } }>(
    '/:id/read',
    { preHandler: [authGuard], schema: { params: markReadParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().markRead(authUser.id, request.params.id);
      return reply.send({ success: true });
    },
  );

  app.put('/read-all', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    await resolveService().markAllRead(authUser.id);
    return reply.send({ success: true });
  });

  app.get('/preferences', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const prefs = await resolveService().getPreferences(authUser.id);
    return reply.send(prefs);
  });

  app.put<{ Body: UpdatePreferencesDto }>(
    '/preferences',
    { preHandler: [authGuard], schema: { body: updatePreferencesSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const prefs = await resolveService().updatePreferences(authUser.id, request.body);
      return reply.send(prefs);
    },
  );

  app.post<{ Body: { token: string; platform: 'web' | 'ios' | 'android' } }>(
    '/push-tokens',
    { preHandler: [authGuard], schema: { body: registerPushTokenSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().registerPushToken(authUser.id, request.body.token, request.body.platform);
      return reply.send({ success: true });
    },
  );

  app.delete<{ Body: { token: string } }>(
    '/push-tokens',
    { preHandler: [authGuard], schema: { body: removePushTokenSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().removePushToken(authUser.id, request.body.token);
      return reply.send({ success: true });
    },
  );
}
