import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReferenceDataRepository } from '../../core/ports/reference-data-repository.port.js';
import type { Platform, Region, Genre, FAQ, PlatformNavItem, PlatformFamily } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('SupabaseReferenceDataRepository');

interface PlatformRow {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  icon_url?: string;
  family_id?: string;
  platform_families?: { id: string; name: string; slug: string; code: string } | null;
}

interface PlatformFamilyRow {
  id: string;
  name: string;
  slug: string;
  code: string;
  icon_url?: string;
  display_order?: number;
}

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

  async findPlatformBySlug(slug: string): Promise<Platform | null> {
    logger.debug('Finding platform by slug', { slug });
    return this.db.queryOne<Platform>('product_platforms', {
      eq: [['slug', slug]],
    });
  }

  async getPlatformNavItems(): Promise<PlatformNavItem[]> {
    logger.debug('Getting platform nav items');

    const rows = await this.db.query<PlatformRow>('product_platforms', {
      select: 'id, name, slug, code, icon_url, platform_families(id, name, slug, code)',
      order: { column: 'name', ascending: true },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug ?? '',
      code: row.code,
      icon_url: row.icon_url,
      family: row.platform_families ?? undefined,
    }));
  }

  async findPlatformFamilyBySlug(slug: string): Promise<PlatformFamily | null> {
    logger.debug('Finding platform family by slug', { slug });

    const family = await this.db.queryOne<PlatformFamilyRow>('platform_families', {
      eq: [['slug', slug]],
    });

    if (!family) {
      return null;
    }

    const platforms = await this.db.query<Platform>('product_platforms', {
      eq: [['family_id', family.id]],
      order: { column: 'name', ascending: true },
    });

    return {
      id: family.id,
      name: family.name,
      slug: family.slug,
      code: family.code,
      icon_url: family.icon_url,
      display_order: family.display_order,
      platforms,
    };
  }
}
