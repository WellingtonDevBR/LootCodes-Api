import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IProfileService } from '../../core/ports/profile-service.port.js';
import type { UpsertProfileDto, ChangeEmailDto, ChangePasswordDto, UpsertSessionDto } from '../../core/services/profile/profile.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  updateProfileSchema,
  changeEmailSchema,
  changePasswordSchema,
  upsertSessionSchema,
  terminateSessionParamsSchema,
} from '../schemas/profile.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function profileRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<IProfileService>(TOKENS.ProfileService);

  app.get('/', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const profile = await resolveService().getProfile(authUser.id);
    return reply.send(profile);
  });

  app.put<{ Body: UpsertProfileDto }>(
    '/',
    { preHandler: [authGuard], schema: { body: updateProfileSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const profile = await resolveService().updateProfile(authUser.id, request.body);
      return reply.send(profile);
    },
  );

  app.delete('/', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    await resolveService().deleteAccount(authUser.id);
    return reply.code(204).send();
  });

  app.put<{ Body: ChangeEmailDto }>(
    '/email',
    { preHandler: [authGuard], schema: { body: changeEmailSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().changeEmail(authUser.id, request.body);
      return reply.send({ success: true });
    },
  );

  app.put<{ Body: ChangePasswordDto }>(
    '/password',
    { preHandler: [authGuard], schema: { body: changePasswordSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().changePassword(authUser.id, request.body);
      return reply.send({ success: true });
    },
  );

  app.get('/role', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const role = await resolveService().getRole(authUser.id);
    return reply.send({ role });
  });

  app.post<{ Body: UpsertSessionDto }>(
    '/sessions',
    { schema: { body: upsertSessionSchema } },
    async (request, reply) => {
      const session = await resolveService().upsertSession(request.body);
      return reply.send(session);
    },
  );

  app.get('/sessions', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const sessions = await resolveService().getActiveSessions(authUser.id);
    return reply.send(sessions);
  });

  app.delete<{ Params: { id: string } }>(
    '/sessions/:id',
    { preHandler: [authGuard], schema: { params: terminateSessionParamsSchema } },
    async (request, reply) => {
      await resolveService().terminateSession(request.params.id);
      return reply.code(204).send();
    },
  );
}
