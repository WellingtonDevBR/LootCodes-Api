import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { ICategoryRepository } from '../../../ports/category-repository.port.js';
import type { Category } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';

@injectable()
export class GetCategoryBySlugUseCase {
  constructor(
    @inject(TOKENS.CategoryRepository) private categoryRepo: ICategoryRepository,
  ) {}

  async execute(slug: string): Promise<Category> {
    const cat = await this.categoryRepo.findBySlug(slug);
    if (!cat) {
      throw new NotFoundError(`Category not found: ${slug}`);
    }
    return cat;
  }
}
