import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IProductRepository } from '../../core/ports/product-repository.port.js';
import type { Product, ProductVariant, ProductPageData, GalleryItem, FeaturedProduct, StockCheckItem, StockCheckResult } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-product-repository');

@injectable()
export class SupabaseProductRepository implements IProductRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async findBySlug(slug: string): Promise<ProductPageData | null> {
    const result = await this.db.rpc<ProductPageData | null>('get_product_page_data', {
      p_slug: slug,
    });
    return result ?? null;
  }

  async findById(id: string): Promise<Product | null> {
    return this.db.queryOne<Product>('products', {
      eq: [['id', id]],
    });
  }

  async getVariants(productId: string): Promise<ProductVariant[]> {
    return this.db.query<ProductVariant>('product_variants', {
      eq: [['product_id', productId]],
      order: { column: 'price_usd', ascending: true },
    });
  }

  async checkStock(variantId: string, quantity: number): Promise<boolean> {
    logger.debug('Checking stock', { variantId, quantity });
    return this.db.rpc<boolean>('is_variant_purchasable', {
      p_variant_id: variantId,
      p_quantity: quantity,
    });
  }

  async batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]> {
    return this.db.rpc<StockCheckResult[]>('check_cart_stock', {
      p_items: items,
    });
  }

  async getGallery(productId: string): Promise<GalleryItem[]> {
    return this.db.query<GalleryItem>('product_gallery', {
      eq: [['product_id', productId]],
      order: { column: 'sort_order', ascending: true },
    });
  }

  async getFeatured(): Promise<FeaturedProduct[]> {
    return this.db.query<FeaturedProduct>('featured_products', {});
  }

  async isVariantPurchasable(variantId: string, quantity: number): Promise<{ purchasable: boolean; reason?: string }> {
    const purchasable = await this.db.rpc<boolean>('is_variant_purchasable', {
      p_variant_id: variantId,
      p_quantity: quantity,
    });
    return { purchasable };
  }

  async getActivePromoHeader(): Promise<{ code: string; message: string; discount_text: string; expires_at: string } | null> {
    const rows = await this.db.query<{ code: string; banner_message: string; discount_text: string; expires_at: string }>('promo_codes', {
      eq: [
        ['show_banner', true],
        ['approval_status', 'approved'],
      ],
      select: 'code, banner_message, discount_text, expires_at',
      limit: 1,
    });
    const row = rows[0];
    if (!row) return null;
    return {
      code: row.code,
      message: row.banner_message,
      discount_text: row.discount_text,
      expires_at: row.expires_at,
    };
  }

  async getTrustpilotData(): Promise<{ score: number; reviews_count: number; stars: number } | null> {
    const row = await this.db.queryOne<{ value: { score: number; reviews_count: number; stars: number } }>('platform_settings', {
      eq: [['key', 'trustpilot_data']],
      select: 'value',
    });
    return row?.value ?? null;
  }
}
