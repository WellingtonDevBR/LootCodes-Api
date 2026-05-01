import type { Review, ProductRating, CreateReviewDto, ReviewEligibility, ReviewPaginationParams } from '../use-cases/reviews/review.types.js';

export interface IReviewRepository {
  listByProduct(productId: string, pagination?: ReviewPaginationParams): Promise<Review[]>;
  getRating(productId: string): Promise<ProductRating>;
  create(userId: string, dto: CreateReviewDto): Promise<Review>;
  checkEligibility(userId: string, productId: string): Promise<ReviewEligibility>;
}
