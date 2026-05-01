import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IProductRepository } from '../../../ports/product-repository.port.js';

@injectable()
export class GetActivePromoHeaderUseCase {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
  ) {}

  async execute(): Promise<{ code: string; message: string; discount_text: string; expires_at: string } | null> {
    return this.productRepo.getActivePromoHeader();
  }
}
