import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../../helpers/test-app.js';
import type { ConvertCartPricesUseCase } from '../../../../../../src/core/use-cases/products/pricing/convert-cart-prices.use-case.js';

describe('ConvertCartPricesUseCase', () => {
  let mocks: TestMocks;
  let useCase: ConvertCartPricesUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<ConvertCartPricesUseCase>(UC_TOKENS.ConvertCartPrices);
  });

  it('returns converted prices for all known variants', async () => {
    const result = await useCase.execute({
      variant_ids: ['v1', 'v2'],
      currency: 'EUR',
    });

    expect(result['v1']).toEqual({ price_cents: 2999, currency: 'EUR' });
    expect(result['v2']).toEqual({ price_cents: 2999, currency: 'EUR' });
  });

  it('returns null for unknown variants when mock has no data', async () => {
    const emptyPricingRepo = mocks.pricingRepo;
    const originalGetBatch = emptyPricingRepo.getBatchPrices.bind(emptyPricingRepo);
    emptyPricingRepo.getBatchPrices = async (ids: string[], currency: string) => {
      const map = await originalGetBatch(ids, currency);
      map.delete('v-unknown');
      return map;
    };

    const result = await useCase.execute({
      variant_ids: ['v1', 'v-unknown'],
      currency: 'EUR',
    });

    expect(result['v1']).toEqual({ price_cents: 2999, currency: 'EUR' });
    expect(result['v-unknown']).toBeNull();
  });
});
