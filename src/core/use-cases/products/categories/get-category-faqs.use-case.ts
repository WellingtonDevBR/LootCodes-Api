import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { ICategoryRepository } from '../../../ports/category-repository.port.js';
import type { FAQ } from '../product.types.js';

@injectable()
export class GetCategoryFaqsUseCase {
  constructor(
    @inject(TOKENS.CategoryRepository) private categoryRepo: ICategoryRepository,
  ) {}

  async execute(categoryId: string): Promise<FAQ[]> {
    return this.categoryRepo.findFaqsByCategoryId(categoryId);
  }
}
