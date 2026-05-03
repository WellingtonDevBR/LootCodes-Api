import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { ListLibraryUseCase } from '../../core/use-cases/library/list-library.use-case.js';
import type { SetLibraryStatusUseCase } from '../../core/use-cases/library/set-library-status.use-case.js';
import type { UpdateLibraryEntryUseCase } from '../../core/use-cases/library/update-library-entry.use-case.js';
import type { RemoveFromLibraryUseCase } from '../../core/use-cases/library/remove-from-library.use-case.js';
import type { RemoveWishlistOnlyUseCase } from '../../core/use-cases/library/remove-wishlist-only.use-case.js';
import type { GetLibraryProductDetailsUseCase } from '../../core/use-cases/library/get-library-product-details.use-case.js';
import type { SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../core/use-cases/library/library.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { ValidationError } from '../../core/errors/domain-errors.js';
import {
  setLibraryStatusSchema,
  updateLibraryEntrySchema,
  libraryProductParamsSchema,
} from '../schemas/library.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function libraryRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authGuard] }, async (request, reply) => {
    const uc = container.resolve<ListLibraryUseCase>(UC_TOKENS.ListLibrary);
    const { authUser } = request as unknown as AuthenticatedRequest;
    const entries = await uc.execute(authUser.id);
    return reply.send(entries);
  });

  app.get<{ Querystring: { ids?: string } }>(
    '/products',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const idsParam = request.query.ids;
      if (!idsParam) {
        throw new ValidationError('Missing required query parameter: ids');
      }

      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length === 0) {
        return reply.send([]);
      }

      if (ids.length > 100) {
        throw new ValidationError('Too many product IDs (max 100)');
      }

      const uc = container.resolve<GetLibraryProductDetailsUseCase>(UC_TOKENS.GetLibraryProductDetails);
      const products = await uc.execute(ids);
      return reply.send(products);
    },
  );

  app.post<{ Body: SetLibraryStatusDto }>(
    '/status',
    { preHandler: [authGuard], schema: { body: setLibraryStatusSchema } },
    async (request, reply) => {
      const uc = container.resolve<SetLibraryStatusUseCase>(UC_TOKENS.SetLibraryStatus);
      const { authUser } = request as unknown as AuthenticatedRequest;
      const entry = await uc.execute(authUser.id, request.body);
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
      const uc = container.resolve<UpdateLibraryEntryUseCase>(UC_TOKENS.UpdateLibraryEntry);
      const { authUser } = request as unknown as AuthenticatedRequest;
      await uc.execute(authUser.id, request.params.productId, request.body);
      return reply.send({ success: true });
    },
  );

  app.delete<{ Params: { productId: string } }>(
    '/:productId/wishlist',
    { preHandler: [authGuard], schema: { params: libraryProductParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<RemoveWishlistOnlyUseCase>(UC_TOKENS.RemoveWishlistOnly);
      const { authUser } = request as unknown as AuthenticatedRequest;
      await uc.execute(authUser.id, request.params.productId);
      return reply.code(204).send();
    },
  );

  app.delete<{ Params: { productId: string } }>(
    '/:productId',
    { preHandler: [authGuard], schema: { params: libraryProductParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<RemoveFromLibraryUseCase>(UC_TOKENS.RemoveFromLibrary);
      const { authUser } = request as unknown as AuthenticatedRequest;
      await uc.execute(authUser.id, request.params.productId);
      return reply.code(204).send();
    },
  );
}
