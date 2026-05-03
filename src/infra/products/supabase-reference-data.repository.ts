import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IReferenceDataRepository, PlatformNavItemGrouped } from '../../core/ports/reference-data-repository.port.js';
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

/** Supabase nests FK embed under the related table name `platform_families`, not `family`. */
interface PlatformNavRowFromDb {
  id: string;
  name: string;
  slug: string;
  code: string;
  icon_url: string | null;
  platform_families: {
    id: string;
    name: string;
    slug: string;
    code: string;
    icon_url: string | null;
    display_order: number;
  } | null;
}

interface PlatformFamilyRow {
  id: string;
  name: string;
  slug: string;
  code: string;
  icon_url?: string;
  display_order?: number;
}

const NON_GAMING_FAMILIES = new Set(['DIGITAL_SERVICES']);

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

  async getPlatformNavItemsWithVariants(): Promise<PlatformNavItemGrouped[]> {
    logger.debug('Getting grouped platform nav items with variant filter');

    const rowsRaw = await this.db.query<PlatformNavRowFromDb>('product_platforms', {
      select: 'id, name, slug, code, icon_url, platform_families!left(id, name, slug, code, icon_url, display_order), product_variants!inner(id)',
      order: { column: 'name', ascending: true },
    });

    // `product_variants!inner` multiplies platforms that have multiple active variants; collapse to one row per platform id.
    const uniqueByPlatform = new Map<string, PlatformNavRowFromDb>();
    for (const row of rowsRaw) {
      if (!uniqueByPlatform.has(row.id)) uniqueByPlatform.set(row.id, row);
    }

    const familyMap = new Map<string, {
      family: NonNullable<PlatformNavRowFromDb['platform_families']>;
      children: PlatformNavRowFromDb[];
    }>();
    const standalone: PlatformNavRowFromDb[] = [];

    for (const row of uniqueByPlatform.values()) {
      const fam = row.platform_families;
      if (fam?.id) {
        const existing = familyMap.get(fam.id);
        if (existing) {
          existing.children.push(row);
        } else {
          familyMap.set(fam.id, { family: fam, children: [row] });
        }
      } else {
        standalone.push(row);
      }
    }

    const items: PlatformNavItemGrouped[] = [];

    const families = [...familyMap.values()].sort(
      (a, b) => (a.family.display_order ?? 99) - (b.family.display_order ?? 99),
    );

    for (const { family, children } of families) {
      if (children.length === 1) {
        const p = children[0];
        items.push({
          name: p.name,
          slug: p.slug,
          code: p.code,
          icon_url: family.icon_url ?? p.icon_url,
          isFamily: false,
          showGenres: !NON_GAMING_FAMILIES.has(family.code),
        });
      } else {
        items.push({
          name: family.name,
          slug: family.slug,
          code: family.code,
          icon_url: family.icon_url,
          isFamily: true,
          showGenres: !NON_GAMING_FAMILIES.has(family.code),
          children: children.map((c) => ({
            name: c.name,
            slug: c.slug,
            code: c.code,
            icon_url: c.icon_url ?? family.icon_url,
          })),
        });
      }
    }

    for (const p of standalone) {
      items.push({
        name: p.name,
        slug: p.slug,
        code: p.code,
        icon_url: p.icon_url,
        isFamily: false,
        showGenres: true,
      });
    }

    return items;
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
