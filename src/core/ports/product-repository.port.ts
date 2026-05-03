import type { Product, ProductVariant, ProductPageData, GalleryItem, FeaturedProduct, StockCheckItem, StockCheckResult, CardVariantRow } from '../use-cases/products/product.types.js';

export interface IProductRepository {
  findBySlugRaw(slug: string): Promise<Record<string, unknown> | null>;
  findBySlug(slug: string): Promise<ProductPageData | null>;
  findById(id: string): Promise<Product | null>;
  getVariants(productId: string): Promise<ProductVariant[]>;
  checkStock(variantId: string, quantity: number): Promise<boolean>;
  batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]>;
  getGallery(productId: string): Promise<GalleryItem[]>;
  getFeatured(): Promise<FeaturedProduct[]>;
  isVariantPurchasable(variantId: string, quantity: number): Promise<{ purchasable: boolean; reason?: string }>;
  getActivePromoHeader(): Promise<{ code: string; message: string; discount_text: string; expires_at: string } | null>;
  getTrustpilotData(): Promise<{ score: number; reviews_count: number; stars: number } | null>;
  getCardVariantsBatch(productIds: string[]): Promise<CardVariantRow[]>;
}
