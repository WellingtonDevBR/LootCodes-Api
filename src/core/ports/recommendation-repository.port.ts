import type { RecommendedProduct, PopularProduct, RecommendationsBatch } from '../use-cases/products/product.types.js';

export interface IRecommendationRepository {
  getSimilar(productId: string, limit: number): Promise<RecommendedProduct[]>;
  getAlsoViewed(productId: string, daysBack: number, limit: number): Promise<RecommendedProduct[]>;
  getBoughtTogether(productId: string, limit: number): Promise<RecommendedProduct[]>;
  getBatch(productId: string, similarLimit: number, alsoViewedLimit: number, boughtTogetherLimit: number): Promise<RecommendationsBatch>;
  getPersonalized(userId: string | null, sessionId: string, limit: number): Promise<RecommendedProduct[]>;
  getPopular(daysBack: number, limit: number): Promise<PopularProduct[]>;
  getLatestReleases(daysBack: number, limit: number): Promise<RecommendedProduct[]>;
  getPreOrders(limit: number): Promise<RecommendedProduct[]>;
}
