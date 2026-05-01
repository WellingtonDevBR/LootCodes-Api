import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { ProductPageData } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';

@injectable()
export class GetProductBySlugUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(slug: string): Promise<ProductPageData> {
    const result = await this.productRepo.findBySlug(slug);
    if (!result) {
      throw new NotFoundError(`Product not found: ${slug}`);
    }
    return result;
  }
}
