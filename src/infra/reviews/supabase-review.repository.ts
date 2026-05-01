import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReviewRepository } from '../../core/ports/review-repository.port.js';
import type { Review, ProductRating, CreateReviewDto, ReviewEligibility, ReviewPaginationParams } from '../../core/use-cases/reviews/review.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-review-repository');

@injectable()
export class SupabaseReviewRepository implements IReviewRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async listByProduct(productId: string, pagination?: ReviewPaginationParams): Promise<Review[]> {
    return this.db.rpc<Review[]>('get_product_reviews_public', {
      p_product_id: productId,
      p_limit: pagination?.limit ?? 20,
      p_offset: pagination?.offset ?? 0,
    });
  }

  async getRating(productId: string): Promise<ProductRating> {
    const result = await this.db.rpc<ProductRating>('get_product_rating', {
      p_product_id: productId,
    });
    return result ?? { average: 0, count: 0 };
  }

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    logger.info('Creating review', { userId, productId: dto.product_id });
    return this.db.insert<Review>('product_reviews', {
      user_id: userId,
      product_id: dto.product_id,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
    });
  }

  async checkEligibility(userId: string, productId: string): Promise<ReviewEligibility> {
    return this.db.rpc<ReviewEligibility>('can_user_review_product', {
      p_user_id: userId,
      p_product_id: productId,
    });
  }
}
