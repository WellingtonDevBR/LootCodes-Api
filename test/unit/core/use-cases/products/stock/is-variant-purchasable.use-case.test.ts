import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../../helpers/test-app.js';
import type { IsVariantPurchasableUseCase } from '../../../../../../src/core/use-cases/products/stock/is-variant-purchasable.use-case.js';
import type { MockProductRepository } from '../../../../../helpers/mock-ports.js';

describe('IsVariantPurchasableUseCase', () => {
  let mocks: TestMocks;
  let useCase: IsVariantPurchasableUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<IsVariantPurchasableUseCase>(UC_TOKENS.IsVariantPurchasable);
  });

  it('should return purchasable true by default', async () => {
    const result = await useCase.execute('variant-1', 1);
    expect(result.purchasable).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should delegate to product repository', async () => {
    const mockRepo = mocks.productRepo as MockProductRepository;
    const originalMethod = mockRepo.isVariantPurchasable.bind(mockRepo);
    let calledWith: { variantId: string; quantity: number } | null = null;

    mockRepo.isVariantPurchasable = async (variantId: string, quantity: number) => {
      calledWith = { variantId, quantity };
      return originalMethod(variantId, quantity);
    };

    await useCase.execute('var-abc', 3);
    expect(calledWith).toEqual({ variantId: 'var-abc', quantity: 3 });
  });

  it('should return not purchasable when repository says so', async () => {
    const mockRepo = mocks.productRepo as MockProductRepository;
    mockRepo.isVariantPurchasable = async () => ({
      purchasable: false,
      reason: 'Out of stock',
    });

    const result = await useCase.execute('variant-1', 5);
    expect(result.purchasable).toBe(false);
    expect(result.reason).toBe('Out of stock');
  });
});
