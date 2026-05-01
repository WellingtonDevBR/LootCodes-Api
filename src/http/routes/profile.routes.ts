import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetProfileUseCase } from '../../core/use-cases/profile/get-profile.use-case.js';
import type { UpdateProfileUseCase } from '../../core/use-cases/profile/update-profile.use-case.js';
import type { DeleteAccountUseCase } from '../../core/use-cases/profile/delete-account.use-case.js';
import type { RestoreAccountUseCase } from '../../core/use-cases/profile/restore-account.use-case.js';
import type { ChangeEmailUseCase } from '../../core/use-cases/profile/change-email.use-case.js';
import type { ChangePasswordUseCase } from '../../core/use-cases/profile/change-password.use-case.js';
import type { GetRoleUseCase } from '../../core/use-cases/profile/get-role.use-case.js';
import type { UpsertSessionUseCase } from '../../core/use-cases/profile/upsert-session.use-case.js';
import type { GetActiveSessionsUseCase } from '../../core/use-cases/profile/get-active-sessions.use-case.js';
import type { TerminateSessionUseCase } from '../../core/use-cases/profile/terminate-session.use-case.js';
import type { UploadAvatarUseCase } from '../../core/use-cases/profile/upload-avatar.use-case.js';
import type { UpsertProfileDto, ChangeEmailDto, ChangePasswordDto, UpsertSessionDto } from '../../core/use-cases/profile/profile.types.js';
import { ValidationError } from '../../core/errors/domain-errors.js';
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
  app.get('/', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const getProfile = container.resolve<GetProfileUseCase>(UC_TOKENS.GetProfile);
    const profile = await getProfile.execute(authUser.id);
    return reply.send(profile);
  });

  app.put<{ Body: UpsertProfileDto }>(
    '/',
    { preHandler: [authGuard], schema: { body: updateProfileSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const updateProfile = container.resolve<UpdateProfileUseCase>(UC_TOKENS.UpdateProfile);
      const profile = await updateProfile.execute(authUser.id, request.body);
      return reply.send(profile);
    },
  );

  app.delete('/', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const deleteAccount = container.resolve<DeleteAccountUseCase>(UC_TOKENS.DeleteAccount);
    await deleteAccount.execute(authUser.id);
    return reply.code(204).send();
  });

  app.post('/restore', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const restoreAccount = container.resolve<RestoreAccountUseCase>(UC_TOKENS.RestoreAccount);
    await restoreAccount.execute(authUser.id);
    return reply.send({ success: true });
  });

  app.put<{ Body: ChangeEmailDto }>(
    '/email',
    { preHandler: [authGuard], schema: { body: changeEmailSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const changeEmail = container.resolve<ChangeEmailUseCase>(UC_TOKENS.ChangeEmail);
      await changeEmail.execute(authUser.id, request.body);
      return reply.send({ success: true });
    },
  );

  app.put<{ Body: ChangePasswordDto }>(
    '/password',
    { preHandler: [authGuard], schema: { body: changePasswordSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const changePassword = container.resolve<ChangePasswordUseCase>(UC_TOKENS.ChangePassword);
      await changePassword.execute(authUser.id, request.body);
      return reply.send({ success: true });
    },
  );

  app.get('/role', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const getRole = container.resolve<GetRoleUseCase>(UC_TOKENS.GetRole);
    const role = await getRole.execute(authUser.id);
    return reply.send({ role });
  });

  app.post<{ Body: UpsertSessionDto }>(
    '/sessions',
    { schema: { body: upsertSessionSchema } },
    async (request, reply) => {
      const upsertSession = container.resolve<UpsertSessionUseCase>(UC_TOKENS.UpsertSession);
      const session = await upsertSession.execute(request.body);
      return reply.send(session);
    },
  );

  app.get('/sessions', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const getActiveSessions = container.resolve<GetActiveSessionsUseCase>(UC_TOKENS.GetActiveSessions);
    const sessions = await getActiveSessions.execute(authUser.id);
    return reply.send(sessions);
  });

  app.delete<{ Params: { id: string } }>(
    '/sessions/:id',
    { preHandler: [authGuard], schema: { params: terminateSessionParamsSchema } },
    async (request, reply) => {
      const terminateSession = container.resolve<TerminateSessionUseCase>(UC_TOKENS.TerminateSession);
      await terminateSession.execute(request.params.id);
      return reply.code(204).send();
    },
  );

  app.post(
    '/avatar',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;

      const data = await request.file();
      if (!data) {
        throw new ValidationError('No file uploaded');
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimes.includes(data.mimetype)) {
        throw new ValidationError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
      }

      const fileBuffer = await data.toBuffer();

      const uploadAvatar = container.resolve<UploadAvatarUseCase>(UC_TOKENS.UploadAvatar);
      const url = await uploadAvatar.execute(authUser.id, fileBuffer, data.mimetype);
      return reply.send({ url });
    },
  );
}
