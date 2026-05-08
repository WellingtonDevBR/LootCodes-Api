import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserLibraryRepository } from '../../core/ports/user-library-repository.port.js';
import type { LibraryEntry, LibraryProductDetails, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../core/use-cases/library/library.types.js';

const PRODUCT_DETAILS_SELECT = 'id,name,slug,image_url,release_date';

interface CardVariantRow {
  product_id: string;
  variant_id: string;
  price_usd: number;
  retail_price_usd: number | null;
  release_date: string | null;
  platform_name: string | null;
  platform_code: string | null;
  region_name: string | null;
  region_code: string | null;
  in_stock: boolean;
  face_value: string | null;
  product_type: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  release_date: string | null;
}

@injectable()
export class SupabaseUserLibraryRepository implements IUserLibraryRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async list(userId: string): Promise<LibraryEntry[]> {
    return this.db.query<LibraryEntry>('user_library', {
      eq: [['user_id', userId]],
      order: { column: 'updated_at', ascending: false },
    });
  }

  async setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry> {
    if (dto.status === 'wishlist') {
      const existing = await this.db.queryOne<LibraryEntry>('user_library', {
        eq: [
          ['user_id', userId],
          ['product_id', dto.product_id],
        ],
        maybeSingle: true,
      });
      if (existing) {
        return existing;
      }
      return this.db.insert<LibraryEntry>('user_library', {
        user_id: userId,
        product_id: dto.product_id,
        status: 'wishlist',
        source: dto.source ?? 'manual',
      });
    }

    return this.db.upsert<LibraryEntry>(
      'user_library',
      {
        user_id: userId,
        product_id: dto.product_id,
        status: dto.status,
        source: dto.source ?? 'manual',
        updated_at: new Date().toISOString(),
      },
      'user_id,product_id',
    );
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.db.delete('user_library', { user_id: userId, product_id: productId });
  }

  async removeWishlistOnly(userId: string, productId: string): Promise<void> {
    await this.db.delete('user_library', {
      user_id: userId,
      product_id: productId,
      status: 'wishlist',
    });
  }

  async update(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void> {
    await this.db.update(
      'user_library',
      { user_id: userId, product_id: productId },
      { ...data, updated_at: new Date().toISOString() },
    );
  }

  async getProductDetails(productIds: string[]): Promise<LibraryProductDetails[]> {
    if (productIds.length === 0) return [];

    const [products, cardRows] = await Promise.all([
      this.db.query<ProductRow>('products', {
        select: PRODUCT_DETAILS_SELECT,
        in: [['id', productIds]],
        eq: [['is_active', true]],
      }),
      this.db.rpc<CardVariantRow[]>('get_product_card_variants', {
        p_product_ids: productIds,
      }),
    ]);

    type LibraryVariant = NonNullable<LibraryProductDetails['product_variants']>[number];
    const variantsByProduct = new Map<string, LibraryVariant[]>();
    const rows = Array.isArray(cardRows) ? cardRows : [];
    for (const row of rows) {
      const list = variantsByProduct.get(row.product_id) ?? [];
      list.push({
        id: row.variant_id,
        price_usd: row.price_usd,
        retail_price_usd: row.retail_price_usd,
        face_value: row.face_value,
        in_stock: row.in_stock,
        product_platforms:
          row.platform_name && row.platform_code
            ? { name: row.platform_name, code: row.platform_code }
            : null,
        product_regions:
          row.region_name && row.region_code
            ? { name: row.region_name, code: row.region_code }
            : null,
      });
      variantsByProduct.set(row.product_id, list);
    }

    return products.map((product) => {
      const variants = variantsByProduct.get(product.id) ?? [];
      const firstWithFaceValue = variants.find((v) => v.face_value);
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: product.image_url,
        release_date: product.release_date,
        face_value: firstWithFaceValue?.face_value ?? null,
        in_stock: variants.some((v) => v.in_stock === true),
        product_variants: variants,
      };
    });
  }
}
