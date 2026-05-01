import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { GalleryItem } from '../product.types.js';

@injectable()
export class GetGalleryUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(productId: string): Promise<GalleryItem[]> {
    return this.productRepo.getGallery(productId);
  }
}
