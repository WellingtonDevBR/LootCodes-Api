import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';

@injectable()
export class IsVariantPurchasableUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(variantId: string, quantity: number): Promise<{ purchasable: boolean; reason?: string }> {
    return this.productRepo.isVariantPurchasable(variantId, quantity);
  }
}
