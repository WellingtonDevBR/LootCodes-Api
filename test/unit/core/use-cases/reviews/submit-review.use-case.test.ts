import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { SubmitReviewUseCase } from '../../../../../src/core/use-cases/reviews/submit-review.use-case.js';

describe('SubmitReviewUseCase', () => {
  let mocks: TestMocks;
  let useCase: SubmitReviewUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<SubmitReviewUseCase>(UC_TOKENS.SubmitReview);
  });

  it('should submit a valid review', async () => {
    const review = await useCase.execute('user-1', {
      product_id: 'product-1',
      rating: 4,
      title: 'Great product',
      body: 'Really enjoyed it',
    });

    expect(review.user_id).toBe('user-1');
    expect(review.product_id).toBe('product-1');
    expect(review.rating).toBe(4);
    expect(review.title).toBe('Great product');
    expect(review.verified_purchase).toBe(true);
  });

  it('should reject rating below 1', async () => {
    await expect(
      useCase.execute('user-1', { product_id: 'product-1', rating: 0 }),
    ).rejects.toThrow('Rating must be an integer between 1 and 5');
  });

  it('should reject rating above 5', async () => {
    await expect(
      useCase.execute('user-1', { product_id: 'product-1', rating: 6 }),
    ).rejects.toThrow('Rating must be an integer between 1 and 5');
  });

  it('should reject non-integer rating', async () => {
    await expect(
      useCase.execute('user-1', { product_id: 'product-1', rating: 3.5 }),
    ).rejects.toThrow('Rating must be an integer between 1 and 5');
  });

  it('should store the review in the repository', async () => {
    await useCase.execute('user-1', {
      product_id: 'product-1',
      rating: 5,
    });

    expect(mocks.reviewRepo.reviews.length).toBe(1);
    expect(mocks.reviewRepo.reviews[0].rating).toBe(5);
  });
});
