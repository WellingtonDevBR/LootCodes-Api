import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetProductReviewsUseCase } from '../../core/use-cases/reviews/get-product-reviews.use-case.js';
import type { GetProductRatingUseCase } from '../../core/use-cases/reviews/get-product-rating.use-case.js';
import type { SubmitReviewUseCase } from '../../core/use-cases/reviews/submit-review.use-case.js';
import type { CheckEligibilityUseCase } from '../../core/use-cases/reviews/check-eligibility.use-case.js';
import type { CreateReviewDto, ReviewPaginationParams } from '../../core/use-cases/reviews/review.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  productIdParamsSchema,
  reviewsPaginationQuerySchema,
  createReviewBodySchema,
  eligibilityParamsSchema,
} from '../schemas/reviews.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function reviewRoutes(app: FastifyInstance) {
  app.get<{ Params: { productId: string }; Querystring: ReviewPaginationParams }>(
    '/products/:productId',
    { schema: { params: productIdParamsSchema, querystring: reviewsPaginationQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetProductReviewsUseCase>(UC_TOKENS.GetProductReviews);
      const reviews = await uc.execute(request.params.productId, request.query);
      return reply.send(reviews);
    },
  );

  app.get<{ Params: { productId: string } }>(
    '/products/:productId/rating',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetProductRatingUseCase>(UC_TOKENS.GetProductRating);
      const rating = await uc.execute(request.params.productId);
      return reply.send(rating);
    },
  );

  app.post<{ Body: CreateReviewDto }>(
    '/',
    { preHandler: [authGuard], schema: { body: createReviewBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<SubmitReviewUseCase>(UC_TOKENS.SubmitReview);
      const review = await uc.execute(authUser.id, request.body);
      return reply.code(201).send(review);
    },
  );

  app.get<{ Params: { productId: string } }>(
    '/eligibility/:productId',
    { preHandler: [authGuard], schema: { params: eligibilityParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<CheckEligibilityUseCase>(UC_TOKENS.CheckEligibility);
      const eligibility = await uc.execute(authUser.id, request.params.productId);
      return reply.send(eligibility);
    },
  );
}
