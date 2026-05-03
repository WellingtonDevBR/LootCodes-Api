import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { CardVariantRow } from '../product.types.js';

@injectable()
export class GetCardVariantsBatchUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(productIds: string[]): Promise<CardVariantRow[]> {
    return this.productRepo.getCardVariantsBatch(productIds);
  }
}
