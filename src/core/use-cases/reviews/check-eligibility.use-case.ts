import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IReviewRepository } from '../../ports/review-repository.port.js';
import type { ReviewEligibility } from './review.types.js';

@injectable()
export class CheckEligibilityUseCase {
  constructor(
    @inject(TOKENS.ReviewRepository) private reviewRepo: IReviewRepository,
  ) {}

  async execute(userId: string, productId: string): Promise<ReviewEligibility> {
    return this.reviewRepo.checkEligibility(userId, productId);
  }
}
