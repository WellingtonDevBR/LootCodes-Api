import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../../helpers/test-app.js';
import type { GetProductBySlugUseCase } from '../../../../../../src/core/use-cases/products/catalog/get-product-by-slug.use-case.js';

describe('GetProductBySlugUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetProductBySlugUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<GetProductBySlugUseCase>(UC_TOKENS.GetProductBySlug);
  });

  it('should return product page data when product exists', async () => {
    mocks.productRepo.products = [
      { id: 'prod-1', name: 'Test Game', slug: 'test-game', status: 'active' },
    ];
    mocks.productRepo.variants = [
      { id: 'var-1', product_id: 'prod-1', price_usd: 2999 },
    ];

    const result = await useCase.execute('test-game');
    expect(result.product.id).toBe('prod-1');
    expect(result.product.slug).toBe('test-game');
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0].price_usd).toBe(2999);
  });

  it('should throw NotFoundError when product does not exist', async () => {
    await expect(useCase.execute('nonexistent-slug')).rejects.toThrow('Product not found: nonexistent-slug');
  });

  it('should return empty variants when product has none', async () => {
    mocks.productRepo.products = [
      { id: 'prod-2', name: 'No Variants', slug: 'no-variants', status: 'active' },
    ];

    const result = await useCase.execute('no-variants');
    expect(result.product.id).toBe('prod-2');
    expect(result.variants).toHaveLength(0);
  });
});
