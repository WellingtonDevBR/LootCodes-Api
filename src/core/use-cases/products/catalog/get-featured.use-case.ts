import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { FeaturedProduct } from '../product.types.js';

@injectable()
export class GetFeaturedUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(): Promise<FeaturedProduct[]> {
    return this.productRepo.getFeatured();
  }
}
