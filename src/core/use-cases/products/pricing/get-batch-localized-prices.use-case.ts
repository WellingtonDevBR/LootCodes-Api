import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';
import type { LocalizedPrice } from '../product.types.js';

@injectable()
export class GetBatchLocalizedPricesUseCase {
  constructor(
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
  ) {}

  async execute(variantIds: string[], currency: string): Promise<Map<string, LocalizedPrice>> {
    return this.pricingRepo.getBatchPrices(variantIds, currency);
  }
}
