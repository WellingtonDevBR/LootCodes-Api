import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReviewRepository } from '../../ports/review-repository.port.js';
import type { ProductRating } from './review.types.js';

@injectable()
export class GetProductRatingUseCase {
  constructor(
    @inject(TOKENS.ReviewRepository) private reviewRepo: IReviewRepository,
  ) {}

  async execute(productId: string): Promise<ProductRating> {
    return this.reviewRepo.getRating(productId);
  }
}
