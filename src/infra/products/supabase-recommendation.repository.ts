import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IRecommendationRepository } from '../../core/ports/recommendation-repository.port.js';
import type { RecommendedProduct, PopularProduct, RecommendationsBatch } from '../../core/use-cases/products/product.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-recommendation-repository');

@injectable()
export class SupabaseRecommendationRepository implements IRecommendationRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getSimilar(productId: string, limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching similar products', { productId, limit });
    return this.db.rpc<RecommendedProduct[]>('get_similar_products', {
      p_product_id: productId,
      p_limit: limit,
    });
  }

  async getAlsoViewed(productId: string, daysBack: number, limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching also-viewed products', { productId, daysBack, limit });
    return this.db.rpc<RecommendedProduct[]>('get_users_also_viewed', {
      p_product_id: productId,
      p_days_back: daysBack,
      p_limit: limit,
    });
  }

  async getBoughtTogether(productId: string, limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching bought-together products', { productId, limit });
    return this.db.rpc<RecommendedProduct[]>('get_frequently_bought_together', {
      p_product_id: productId,
      p_limit: limit,
    });
  }

  async getBatch(
    productId: string,
    similarLimit: number,
    alsoViewedLimit: number,
    boughtTogetherLimit: number,
  ): Promise<RecommendationsBatch> {
    logger.debug('Fetching recommendations batch', { productId });
    return this.db.rpc<RecommendationsBatch>('get_product_recommendations_batch', {
      p_product_id: productId,
      p_similar_limit: similarLimit,
      p_also_viewed_limit: alsoViewedLimit,
      p_bought_together_limit: boughtTogetherLimit,
    });
  }

  async getPersonalized(userId: string | null, sessionId: string, limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching personalized recommendations', { sessionId, limit });
    return this.db.rpc<RecommendedProduct[]>('get_personalized_recommendations', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_limit: limit,
    });
  }

  async getPopular(daysBack: number, limit: number): Promise<PopularProduct[]> {
    logger.debug('Fetching popular products', { daysBack, limit });
    return this.db.rpc<PopularProduct[]>('get_popular_products', {
      days_back: daysBack,
      limit_count: limit,
    });
  }

  async getLatestReleases(daysBack: number, limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching latest releases', { daysBack, limit });
    return this.db.rpc<RecommendedProduct[]>('get_latest_releases', {
      p_days_back: daysBack,
      p_limit: limit,
    });
  }

  async getPreOrders(limit: number): Promise<RecommendedProduct[]> {
    logger.debug('Fetching pre-orders', { limit });
    const rows = await this.db.query<RecommendedProduct>('products', {
      select: 'id, name, slug, image_url, release_date',
      eq: [['is_active', true]],
      order: { column: 'release_date', ascending: true },
      limit,
    });

    return rows.filter((row) => {
      if (!('release_date' in row)) return false;
      const releaseDate = (row as unknown as Record<string, unknown>).release_date;
      return typeof releaseDate === 'string' && new Date(releaseDate) > new Date();
    });
  }
}
