import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductRepository } from '../../ports/product-repository.port.js';
import type { IReferenceDataRepository } from '../../ports/reference-data-repository.port.js';
import type { IStockNotificationRepository } from '../../ports/stock-notification-repository.port.js';
import type { IProductService } from '../../ports/product-service.port.js';
import type {
  ProductPageData,
  Product,
  ProductVariant,
  Platform,
  Region,
  Genre,
  FAQ,
  GalleryItem,
  FeaturedProduct,
  StockCheckItem,
  StockCheckResult,
} from './product.types.js';
import { NotFoundError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('product-service');

@injectable()
export class ProductService implements IProductService {
  constructor(
    @inject(TOKENS.ProductRepository) private productRepo: IProductRepository,
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
    @inject(TOKENS.StockNotificationRepository) private stockNotifRepo: IStockNotificationRepository,
  ) {}

  async getProductBySlug(slug: string): Promise<ProductPageData> {
    const result = await this.productRepo.findBySlug(slug);
    if (!result) {
      throw new NotFoundError(`Product not found: ${slug}`);
    }
    return result;
  }

  async getProductById(id: string): Promise<Product> {
    const result = await this.productRepo.findById(id);
    if (!result) {
      throw new NotFoundError(`Product not found: ${id}`);
    }
    return result;
  }

  async getVariants(productId: string): Promise<ProductVariant[]> {
    return this.productRepo.getVariants(productId);
  }

  async checkStock(variantId: string, quantity: number): Promise<boolean> {
    return this.productRepo.checkStock(variantId, quantity);
  }

  async batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]> {
    return this.productRepo.batchCheckStock(items);
  }

  async getGallery(productId: string): Promise<GalleryItem[]> {
    return this.productRepo.getGallery(productId);
  }

  async getFeatured(): Promise<FeaturedProduct[]> {
    return this.productRepo.getFeatured();
  }

  async getPlatforms(): Promise<Platform[]> {
    return this.referenceRepo.getPlatforms();
  }

  async getRegions(): Promise<Region[]> {
    return this.referenceRepo.getRegions();
  }

  async getGenres(): Promise<Genre[]> {
    return this.referenceRepo.getGenres();
  }

  async getFAQs(): Promise<FAQ[]> {
    return this.referenceRepo.getFAQs();
  }

  async subscribeStockNotification(userId: string, variantId: string, email: string): Promise<void> {
    logger.info('Stock notification subscribe', { userId, variantId });
    await this.stockNotifRepo.subscribe(userId, variantId, email);
  }

  async unsubscribeStockNotification(userId: string, variantId: string): Promise<void> {
    logger.info('Stock notification unsubscribe', { userId, variantId });
    await this.stockNotifRepo.unsubscribe(userId, variantId);
  }

  async isSubscribedToStock(userId: string, variantId: string): Promise<boolean> {
    return this.stockNotifRepo.isSubscribed(userId, variantId);
  }
}
