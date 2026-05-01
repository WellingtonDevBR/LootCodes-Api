import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';

interface ConvertCartPricesDto {
  variant_ids: string[];
  currency: string;
}

interface VariantPrice {
  price_cents: number;
  currency: string;
}

@injectable()
export class ConvertCartPricesUseCase {
  constructor(
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
  ) {}

  async execute(dto: ConvertCartPricesDto): Promise<Record<string, VariantPrice | null>> {
    const prices = await this.pricingRepo.getBatchPrices(dto.variant_ids, dto.currency);

    const result: Record<string, VariantPrice | null> = {};
    for (const id of dto.variant_ids) {
      const entry = prices.get(id);
      result[id] = entry ? { price_cents: entry.price_cents, currency: entry.currency } : null;
    }

    return result;
  }
}
