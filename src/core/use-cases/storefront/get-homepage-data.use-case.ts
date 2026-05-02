import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IDatabase } from '../../ports/database.port.js';
import { createLogger } from '../../../shared/logger.js';
import type {
  HomepageData,
  HomepageRecommendation,
  ProductCardVariant,
  PurchaseRewardConfig,
} from './homepage.types.js';

const logger = createLogger('get-homepage-data-use-case');

const DEFAULT_RECOMMENDATION_LIMIT = 10;

const DEFAULT_REWARD_CONFIG: PurchaseRewardConfig = {
  enabled: false,
  ttl_days: 0,
  max_cents: 0,
  flat_cents: 0,
  percent_bps: 0,
  min_subtotal_cents: 0,
};

interface ExecuteParams {
  userId?: string;
  sessionId?: string;
}

@injectable()
export class GetHomepageDataUseCase {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async execute(params: ExecuteParams): Promise<HomepageData> {
    const { userId, sessionId } = params;

    const [recommendations, rewardConfig, libraryIds] = await Promise.all([
      this.fetchRecommendations(userId ?? null, sessionId ?? ''),
      this.fetchRewardConfig(),
      userId ? this.fetchLibraryProductIds(userId) : Promise.resolve([]),
    ]);

    const productIds = recommendations.map((r) => r.product_id);
    const variants = productIds.length > 0
      ? await this.fetchCardVariants(productIds)
      : [];

    return {
      recommendations,
      variants,
      purchaseRewardConfig: rewardConfig,
      userLibraryProductIds: libraryIds,
    };
  }

  private async fetchRecommendations(
    userId: string | null,
    sessionId: string,
  ): Promise<HomepageRecommendation[]> {
    try {
      return await this.db.rpc<HomepageRecommendation[]>(
        'get_personalized_recommendations',
        {
          p_user_id: userId,
          p_session_id: sessionId,
          p_limit: DEFAULT_RECOMMENDATION_LIMIT,
        },
      );
    } catch (err) {
      logger.warn('Failed to fetch recommendations', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async fetchRewardConfig(): Promise<PurchaseRewardConfig> {
    try {
      return await this.db.rpc<PurchaseRewardConfig>('get_purchase_reward_config');
    } catch (err) {
      logger.warn('Failed to fetch purchase reward config', {
        error: err instanceof Error ? err.message : String(err),
      });
      return DEFAULT_REWARD_CONFIG;
    }
  }

  private async fetchLibraryProductIds(userId: string): Promise<string[]> {
    try {
      const rows = await this.db.query<{ product_id: string }>('user_library', {
        select: 'product_id',
        eq: [['user_id', userId]],
      });
      return rows.map((r) => r.product_id);
    } catch (err) {
      logger.warn('Failed to fetch user library', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async fetchCardVariants(productIds: string[]): Promise<ProductCardVariant[]> {
    try {
      return await this.db.rpc<ProductCardVariant[]>('get_product_card_variants', {
        p_product_ids: productIds,
      });
    } catch (err) {
      logger.warn('Failed to fetch product card variants', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }
}
