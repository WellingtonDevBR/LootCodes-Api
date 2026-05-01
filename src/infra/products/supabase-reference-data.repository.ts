import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReferenceDataRepository } from '../../core/ports/reference-data-repository.port.js';
import type { Platform, Region, Genre, FAQ } from '../../core/services/products/product.types.js';

@injectable()
export class SupabaseReferenceDataRepository implements IReferenceDataRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getPlatforms(): Promise<Platform[]> {
    return this.db.query<Platform>('product_platforms', {
      order: { column: 'name', ascending: true },
    });
  }

  async getRegions(): Promise<Region[]> {
    return this.db.query<Region>('product_regions', {
      order: { column: 'name', ascending: true },
    });
  }

  async getGenres(): Promise<Genre[]> {
    return this.db.query<Genre>('genres', {
      order: { column: 'name', ascending: true },
    });
  }

  async getFAQs(): Promise<FAQ[]> {
    return this.db.query<FAQ>('faqs', {
      order: { column: 'sort_order', ascending: true },
    });
  }
}
