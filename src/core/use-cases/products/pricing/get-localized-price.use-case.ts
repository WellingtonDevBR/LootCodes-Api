import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';
import type { LocalizedPrice } from '../product.types.js';

@injectable()
export class GetLocalizedPriceUseCase {
  constructor(
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
  ) {}

  async execute(variantId: string, currency: string): Promise<LocalizedPrice | null> {
    return this.pricingRepo.getPrice(variantId, currency);
  }
}
