import type { Review, ProductRating, CreateReviewDto, ReviewEligibility, ReviewPaginationParams } from '../services/reviews/review.types.js';

export interface IReviewService {
  getProductReviews(productId: string, pagination?: ReviewPaginationParams): Promise<Review[]>;
  getProductRating(productId: string): Promise<ProductRating>;
  submitReview(userId: string, dto: CreateReviewDto): Promise<Review>;
  checkEligibility(userId: string, productId: string): Promise<ReviewEligibility>;
}
