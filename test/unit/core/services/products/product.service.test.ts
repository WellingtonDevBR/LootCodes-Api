import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IProductService } from '../../../../../src/core/ports/product-service.port.js';

describe('ProductService', () => {
  let mocks: TestMocks;
  let service: IProductService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IProductService>(TOKENS.ProductService);
  });

  describe('getProductBySlug', () => {
    it('should return product page data', async () => {
      mocks.productRepo.products.push({ id: 'prod-1', name: 'Test Game', slug: 'test-game', status: 'active' });
      mocks.productRepo.variants.push({ id: 'var-1', product_id: 'prod-1', price_usd: 2999 });
      const result = await service.getProductBySlug('test-game');
      expect(result.product.name).toBe('Test Game');
      expect(result.variants.length).toBe(1);
    });

    it('should throw NotFoundError for unknown slug', async () => {
      await expect(service.getProductBySlug('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('getProductById', () => {
    it('should return product', async () => {
      mocks.productRepo.products.push({ id: 'prod-1', name: 'Test', slug: 'test', status: 'active' });
      const product = await service.getProductById('prod-1');
      expect(product.id).toBe('prod-1');
    });

    it('should throw NotFoundError for unknown id', async () => {
      await expect(service.getProductById('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('reference data', () => {
    it('should return platforms', async () => {
      const platforms = await service.getPlatforms();
      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms[0].name).toBe('PC');
    });

    it('should return regions', async () => {
      const regions = await service.getRegions();
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should return genres', async () => {
      const genres = await service.getGenres();
      expect(genres.length).toBeGreaterThan(0);
    });
  });

  describe('checkStock', () => {
    it('should return true when in stock', async () => {
      const available = await service.checkStock('var-1', 1);
      expect(available).toBe(true);
    });
  });

  describe('batchCheckStock', () => {
    it('should return availability for all items', async () => {
      const results = await service.batchCheckStock([{ variant_id: 'var-1', quantity: 1 }]);
      expect(results.length).toBe(1);
      expect(results[0].available).toBe(true);
    });
  });

  describe('stock notifications', () => {
    it('should subscribe and unsubscribe', async () => {
      await service.subscribeStockNotification('user-1', 'var-1', 'user@example.com');
      expect(await service.isSubscribedToStock('user-1', 'var-1')).toBe(true);

      await service.unsubscribeStockNotification('user-1', 'var-1');
      expect(await service.isSubscribedToStock('user-1', 'var-1')).toBe(false);
    });
  });
});
