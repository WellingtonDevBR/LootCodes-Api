import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';

@injectable()
export class HasPricesForCurrencyUseCase {
  constructor(
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
  ) {}

  async execute(currency: string): Promise<boolean> {
    return this.pricingRepo.hasPricesForCurrency(currency);
  }
}
