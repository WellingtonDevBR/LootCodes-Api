import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';
import type { StockCheckItem, StockCheckResult } from '../product.types.js';

@injectable()
export class BatchCheckStockUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(items: StockCheckItem[]): Promise<StockCheckResult[]> {
    return this.productRepo.batchCheckStock(items);
  }
}
