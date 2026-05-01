import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';

@injectable()
export class CheckStockUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(variantId: string, quantity: number): Promise<boolean> {
    return this.productRepo.checkStock(variantId, quantity);
  }
}
