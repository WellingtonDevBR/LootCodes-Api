import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { ICategoryRepository } from '../../../ports/category-repository.port.js';
import type { Category } from '../product.types.js';

@injectable()
export class GetCategoriesUseCase {
  constructor(
    @inject(TOKENS.CategoryRepository) private categoryRepo: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepo.listActive();
  }
}
