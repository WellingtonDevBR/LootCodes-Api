import type { Category, FAQ } from '../use-cases/products/product.types.js';

export interface ICategoryRepository {
  listActive(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  findSubcategories(parentId: string): Promise<Category[]>;
  findFaqsByCategoryId(categoryId: string): Promise<FAQ[]>;
}
