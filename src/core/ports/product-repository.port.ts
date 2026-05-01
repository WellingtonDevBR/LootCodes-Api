import type { Product, ProductVariant, ProductPageData, GalleryItem, FeaturedProduct, StockCheckItem, StockCheckResult } from '../services/products/product.types.js';

export interface IProductRepository {
  findBySlug(slug: string): Promise<ProductPageData | null>;
  findById(id: string): Promise<Product | null>;
  getVariants(productId: string): Promise<ProductVariant[]>;
  checkStock(variantId: string, quantity: number): Promise<boolean>;
  batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]>;
  getGallery(productId: string): Promise<GalleryItem[]>;
  getFeatured(): Promise<FeaturedProduct[]>;
}
