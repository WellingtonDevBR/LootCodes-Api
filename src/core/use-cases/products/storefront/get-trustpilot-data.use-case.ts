import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';

@injectable()
export class GetTrustpilotDataUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(): Promise<{ score: number; reviews_count: number; stars: number } | null> {
    return this.productRepo.getTrustpilotData();
  }
}
