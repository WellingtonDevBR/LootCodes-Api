import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { ProductVariant } from '../product.types.js';

@injectable()
export class GetVariantsUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(productId: string): Promise<ProductVariant[]> {
    return this.productRepo.getVariants(productId);
  }
}
