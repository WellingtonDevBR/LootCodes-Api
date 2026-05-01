import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReviewRepository } from '../../ports/review-repository.port.js';
import type { Review, CreateReviewDto } from './review.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('submit-review-use-case');

@injectable()
export class SubmitReviewUseCase {
  constructor(
    @inject(TOKENS.ReviewRepository) private reviewRepo: IReviewRepository,
  ) {}

  async execute(userId: string, dto: CreateReviewDto): Promise<Review> {
    if (dto.rating < 1 || dto.rating > 5 || !Number.isInteger(dto.rating)) {
      throw new ValidationError('Rating must be an integer between 1 and 5');
    }

    const eligibility = await this.reviewRepo.checkEligibility(userId, dto.product_id);
    if (!eligibility.eligible) {
      throw new ValidationError(eligibility.reason ?? 'Not eligible to review this product');
    }

    logger.info('Submitting review', { userId, productId: dto.product_id, rating: dto.rating });
    return this.reviewRepo.create(userId, dto);
  }
}
