import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IReviewService } from '../../core/ports/review-service.port.js';
import type { CreateReviewDto, ReviewPaginationParams } from '../../core/services/reviews/review.types.js';
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
  const resolveService = () => container.resolve<IReviewService>(TOKENS.ReviewService);

  app.get<{ Params: { productId: string }; Querystring: ReviewPaginationParams }>(
    '/products/:productId',
    { schema: { params: productIdParamsSchema, querystring: reviewsPaginationQuerySchema } },
    async (request, reply) => {
      const reviews = await resolveService().getProductReviews(
        request.params.productId,
        request.query,
      );
      return reply.send(reviews);
    },
  );

  app.get<{ Params: { productId: string } }>(
    '/products/:productId/rating',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const rating = await resolveService().getProductRating(request.params.productId);
      return reply.send(rating);
    },
  );

  app.post<{ Body: CreateReviewDto }>(
    '/',
    { preHandler: [authGuard], schema: { body: createReviewBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const review = await resolveService().submitReview(authUser.id, request.body);
      return reply.code(201).send(review);
    },
  );

  app.get<{ Params: { productId: string } }>(
    '/eligibility/:productId',
    { preHandler: [authGuard], schema: { params: eligibilityParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const eligibility = await resolveService().checkEligibility(
        authUser.id,
        request.params.productId,
      );
      return reply.send(eligibility);
    },
  );
}
