import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserLibraryRepository } from '../../core/ports/user-library-repository.port.js';
import type { LibraryEntry, LibraryProductDetails, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../core/use-cases/library/library.types.js';

const PRODUCT_DETAILS_SELECT = [
  'id', 'name', 'slug', 'image_url', 'face_value', 'in_stock', 'release_date',
  'product_variants!inner(id, price_usd, retail_price_usd, region_id,',
  '  product_platforms(name, code),',
  '  product_regions(name, code)',
  ')',
].join(' ');

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
    return this.db.query<LibraryProductDetails>('products', {
      select: PRODUCT_DETAILS_SELECT,
      in: [['id', productIds]],
      eq: [['is_active', true]],
    });
  }
}
