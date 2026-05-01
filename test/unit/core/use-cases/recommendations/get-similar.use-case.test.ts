import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetSimilarUseCase } from '../../../../../src/core/use-cases/recommendations/get-similar.use-case.js';

describe('GetSimilarUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetSimilarUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<GetSimilarUseCase>(UC_TOKENS.GetSimilar);
  });

  it('returns empty array when no recommendations exist', async () => {
    const result = await useCase.execute('product-xyz');

    expect(result).toEqual([]);
  });
});
