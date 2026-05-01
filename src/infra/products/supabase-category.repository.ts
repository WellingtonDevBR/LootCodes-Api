import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ICategoryRepository } from '../../core/ports/category-repository.port.js';
import type { Category, FAQ } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('SupabaseCategoryRepository');

@injectable()
export class SupabaseCategoryRepository implements ICategoryRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async listActive(): Promise<Category[]> {
    logger.debug('Listing active categories');
    return this.db.query<Category>('categories', {
      select: 'id, name, slug',
      eq: [['is_active', true]],
      order: { column: 'sort_order', ascending: true },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    logger.debug('Finding category by slug', { slug });
    return this.db.queryOne<Category>('categories', {
      eq: [['slug', slug], ['is_active', true]],
    });
  }

  async findSubcategories(parentId: string): Promise<Category[]> {
    logger.debug('Finding subcategories', { parentId });
    return this.db.query<Category>('categories', {
      eq: [['parent_category_id', parentId], ['is_active', true]],
      order: { column: 'sort_order', ascending: true },
    });
  }

  async findFaqsByCategoryId(categoryId: string): Promise<FAQ[]> {
    logger.debug('Finding FAQs by category', { categoryId });
    return this.db.query<FAQ>('faqs', {
      eq: [['product_category_id', categoryId], ['is_active', true]],
      order: { column: 'sort_order', ascending: true },
    });
  }
}
