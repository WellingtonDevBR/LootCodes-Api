import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IReviewService } from '../../../../../src/core/ports/review-service.port.js';

describe('ReviewService', () => {
  let mocks: TestMocks;
  let service: IReviewService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IReviewService>(TOKENS.ReviewService);
  });

  describe('getProductReviews', () => {
    it('should return reviews for product', async () => {
      mocks.reviewRepo.reviews.push(
        { id: 'r1', product_id: 'prod-1', user_id: 'u1', rating: 5, verified_purchase: true },
        { id: 'r2', product_id: 'prod-2', user_id: 'u2', rating: 4, verified_purchase: true },
      );
      const reviews = await service.getProductReviews('prod-1');
      expect(reviews.length).toBe(1);
      expect(reviews[0].rating).toBe(5);
    });
  });

  describe('getProductRating', () => {
    it('should return average rating', async () => {
      mocks.reviewRepo.reviews.push(
        { id: 'r1', product_id: 'prod-1', user_id: 'u1', rating: 5, verified_purchase: true },
        { id: 'r2', product_id: 'prod-1', user_id: 'u2', rating: 3, verified_purchase: true },
      );
      const rating = await service.getProductRating('prod-1');
      expect(rating.average).toBe(4);
      expect(rating.count).toBe(2);
    });

    it('should return zero for no reviews', async () => {
      const rating = await service.getProductRating('prod-1');
      expect(rating.average).toBe(0);
      expect(rating.count).toBe(0);
    });
  });

  describe('submitReview', () => {
    it('should submit valid review', async () => {
      const review = await service.submitReview('user-1', { product_id: 'prod-1', rating: 4, title: 'Great', body: 'Loved it' });
      expect(review.rating).toBe(4);
      expect(review.product_id).toBe('prod-1');
    });

    it('should reject rating below 1', async () => {
      await expect(service.submitReview('user-1', { product_id: 'prod-1', rating: 0 })).rejects.toThrow('between 1 and 5');
    });

    it('should reject rating above 5', async () => {
      await expect(service.submitReview('user-1', { product_id: 'prod-1', rating: 6 })).rejects.toThrow('between 1 and 5');
    });

    it('should reject non-integer rating', async () => {
      await expect(service.submitReview('user-1', { product_id: 'prod-1', rating: 3.5 })).rejects.toThrow('integer');
    });
  });

  describe('checkEligibility', () => {
    it('should return eligibility status', async () => {
      const result = await service.checkEligibility('user-1', 'prod-1');
      expect(result.eligible).toBe(true);
    });
  });
});
