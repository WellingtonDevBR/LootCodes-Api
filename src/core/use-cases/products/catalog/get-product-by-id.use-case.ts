import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { Product } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';

@injectable()
export class GetProductByIdUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(id: string): Promise<Product> {
    const result = await this.productRepo.findById(id);
    if (!result) {
      throw new NotFoundError(`Product not found: ${id}`);
    }
    return result;
  }
}
