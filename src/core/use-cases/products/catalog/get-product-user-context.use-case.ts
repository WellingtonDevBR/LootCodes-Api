import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../../di/tokens.js';
import type { CheckEligibilityUseCase } from '../../reviews/check-eligibility.use-case.js';
import type { IStockNotificationRepository } from '../../../ports/stock-notification-repository.port.js';
import type { ReviewEligibility } from '../../reviews/review.types.js';
import { createLogger } from '../../../../shared/logger.js';

const logger = createLogger('get-product-user-context');

export interface ProductUserContextResult {
  review_eligibility: ReviewEligibility;
  stock_subscriptions: string[];
}

@injectable()
export class GetProductUserContextUseCase {
  constructor(
    @inject(UC_TOKENS.CheckEligibility) private checkEligibility: CheckEligibilityUseCase,
    @inject(TOKENS.StockNotificationRepository) private stockNotifRepo: IStockNotificationRepository,
  ) {}

  async execute(userId: string, productId: string, variantIds: string[]): Promise<ProductUserContextResult> {
    const [reviewEligibility, stockSubscriptions] = await Promise.all([
      this.checkEligibility.execute(userId, productId).catch((err) => {
        logger.warn('Review eligibility check failed', { userId, productId, error: String(err) });
        return { eligible: false, reason: 'error' } as ReviewEligibility;
      }),
      this.stockNotifRepo.getSubscribedVariantIds(userId, variantIds).catch((err) => {
        logger.warn('Stock subscription check failed', { userId, error: String(err) });
        return [] as string[];
      }),
    ]);

    return {
      review_eligibility: reviewEligibility,
      stock_subscriptions: stockSubscriptions,
    };
  }
}
