import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetSimilarUseCase } from '../../core/use-cases/recommendations/get-similar.use-case.js';
import type { GetAlsoViewedUseCase } from '../../core/use-cases/recommendations/get-also-viewed.use-case.js';
import type { GetBoughtTogetherUseCase } from '../../core/use-cases/recommendations/get-bought-together.use-case.js';
import type { GetBatchRecommendationsUseCase } from '../../core/use-cases/recommendations/get-batch-recommendations.use-case.js';
import type { GetPersonalizedUseCase } from '../../core/use-cases/recommendations/get-personalized.use-case.js';
import type { GetPopularUseCase } from '../../core/use-cases/recommendations/get-popular.use-case.js';
import type { GetLatestReleasesUseCase } from '../../core/use-cases/recommendations/get-latest-releases.use-case.js';
import type { GetPreOrdersUseCase } from '../../core/use-cases/recommendations/get-pre-orders.use-case.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  productIdParamsSchema,
  limitQuerySchema,
  alsoViewedQuerySchema,
  boughtTogetherQuerySchema,
  personalizedQuerySchema,
  popularQuerySchema,
  latestReleasesQuerySchema,
  preOrdersQuerySchema,
} from '../schemas/recommendations.schema.js';

interface AuthenticatedRequest {
  authUser?: { id: string; email?: string };
}

export async function recommendationsRoutes(app: FastifyInstance) {
  app.get<{ Params: { productId: string }; Querystring: { limit?: number } }>(
    '/similar/:productId',
    { schema: { params: productIdParamsSchema, querystring: limitQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetSimilarUseCase>(UC_TOKENS.GetSimilar);
      const data = await uc.execute(request.params.productId, request.query.limit);
      return reply.send(data);
    },
  );

  app.get<{ Params: { productId: string }; Querystring: { daysBack?: number; limit?: number } }>(
    '/also-viewed/:productId',
    { schema: { params: productIdParamsSchema, querystring: alsoViewedQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetAlsoViewedUseCase>(UC_TOKENS.GetAlsoViewed);
      const data = await uc.execute(
        request.params.productId,
        request.query.daysBack,
        request.query.limit,
      );
      return reply.send(data);
    },
  );

  app.get<{ Params: { productId: string }; Querystring: { limit?: number } }>(
    '/bought-together/:productId',
    { schema: { params: productIdParamsSchema, querystring: boughtTogetherQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetBoughtTogetherUseCase>(UC_TOKENS.GetBoughtTogether);
      const data = await uc.execute(request.params.productId, request.query.limit);
      return reply.send(data);
    },
  );

  app.get<{ Params: { productId: string } }>(
    '/batch/:productId',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetBatchRecommendationsUseCase>(UC_TOKENS.GetBatchRecommendations);
      const data = await uc.execute(request.params.productId);
      return reply.send(data);
    },
  );

  app.get<{ Querystring: { sessionId: string; limit?: number } }>(
    '/personalized',
    {
      schema: { querystring: personalizedQuerySchema },
      preHandler: [optionalAuthGuard],
    },
    async (request, reply) => {
      const uc = container.resolve<GetPersonalizedUseCase>(UC_TOKENS.GetPersonalized);
      const authUser = (request as unknown as AuthenticatedRequest).authUser;
      const userId = authUser?.id ?? null;
      const data = await uc.execute(userId, request.query.sessionId, request.query.limit);
      return reply.send(data);
    },
  );

  app.get<{ Querystring: { daysBack?: number; limit?: number } }>(
    '/popular',
    { schema: { querystring: popularQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetPopularUseCase>(UC_TOKENS.GetPopular);
      const data = await uc.execute(request.query.daysBack, request.query.limit);
      return reply.send(data);
    },
  );

  app.get<{ Querystring: { daysBack?: number; limit?: number } }>(
    '/latest-releases',
    { schema: { querystring: latestReleasesQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetLatestReleasesUseCase>(UC_TOKENS.GetLatestReleases);
      const data = await uc.execute(request.query.daysBack, request.query.limit);
      return reply.send(data);
    },
  );

  app.get<{ Querystring: { limit?: number } }>(
    '/pre-orders',
    { schema: { querystring: preOrdersQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetPreOrdersUseCase>(UC_TOKENS.GetPreOrders);
      const data = await uc.execute(request.query.limit);
      return reply.send(data);
    },
  );
}

async function optionalAuthGuard(request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return;
  }
  try {
    await authGuard(request, reply);
  } catch {
    // Auth is optional — swallow failures silently
  }
}
