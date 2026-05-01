import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReviewRepository } from '../../ports/review-repository.port.js';
import type { Review, ReviewPaginationParams } from './review.types.js';

@injectable()
export class GetProductReviewsUseCase {
  constructor(
    @inject(TOKENS.ReviewRepository) private reviewRepo: IReviewRepository,
  ) {}

  async execute(productId: string, pagination?: ReviewPaginationParams): Promise<Review[]> {
    return this.reviewRepo.listByProduct(productId, pagination);
  }
}
