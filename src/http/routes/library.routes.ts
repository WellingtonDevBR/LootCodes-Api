import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { ILibraryService } from '../../core/ports/library-service.port.js';
import type { SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../core/services/library/library.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  setLibraryStatusSchema,
  updateLibraryEntrySchema,
  libraryProductParamsSchema,
} from '../schemas/library.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function libraryRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<ILibraryService>(TOKENS.LibraryService);

  app.get('/', { preHandler: [authGuard] }, async (request, reply) => {
    const { authUser } = request as unknown as AuthenticatedRequest;
    const entries = await resolveService().listLibrary(authUser.id);
    return reply.send(entries);
  });

  app.post<{ Body: SetLibraryStatusDto }>(
    '/status',
    { preHandler: [authGuard], schema: { body: setLibraryStatusSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const entry = await resolveService().setStatus(authUser.id, request.body);
      return reply.send(entry);
    },
  );

  app.put<{ Params: { productId: string }; Body: UpdateLibraryEntryDto }>(
    '/:productId',
    {
      preHandler: [authGuard],
      schema: { params: libraryProductParamsSchema, body: updateLibraryEntrySchema },
    },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().updateEntry(authUser.id, request.params.productId, request.body);
      return reply.send({ success: true });
    },
  );

  app.delete<{ Params: { productId: string } }>(
    '/:productId',
    { preHandler: [authGuard], schema: { params: libraryProductParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().removeFromLibrary(authUser.id, request.params.productId);
      return reply.code(204).send();
    },
  );
}
