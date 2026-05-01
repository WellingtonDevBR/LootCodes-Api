import type { ProductPageData, Product, ProductVariant, Platform, Region, Genre, FAQ, GalleryItem, FeaturedProduct, StockCheckItem, StockCheckResult } from '../services/products/product.types.js';

export interface IProductService {
  getProductBySlug(slug: string): Promise<ProductPageData>;
  getProductById(id: string): Promise<Product>;
  getVariants(productId: string): Promise<ProductVariant[]>;
  checkStock(variantId: string, quantity: number): Promise<boolean>;
  batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]>;
  getGallery(productId: string): Promise<GalleryItem[]>;
  getFeatured(): Promise<FeaturedProduct[]>;
  getPlatforms(): Promise<Platform[]>;
  getRegions(): Promise<Region[]>;
  getGenres(): Promise<Genre[]>;
  getFAQs(): Promise<FAQ[]>;
  subscribeStockNotification(userId: string, variantId: string, email: string): Promise<void>;
  unsubscribeStockNotification(userId: string, variantId: string): Promise<void>;
  isSubscribedToStock(userId: string, variantId: string): Promise<boolean>;
}
