import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { StorefrontProductPageData } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';
import { mapProductPageResponse } from './map-product-page-response.js';

@injectable()
export class GetProductBySlugUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(slug: string): Promise<StorefrontProductPageData> {
    const raw = await this.productRepo.findBySlugRaw(slug);
    if (!raw) {
      throw new NotFoundError(`Product not found: ${slug}`);
    }
    return mapProductPageResponse(raw);
  }
}
