import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IPriceMatchRepository } from '../../core/ports/price-match-repository.port.js';
import type { PriceMatchClaim, PriceMatchClaimSubmission, PriceMatchClaimResult, PriceMatchConfig } from '../../core/services/price-match/price-match.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-price-match-repository');

@injectable()
export class SupabasePriceMatchRepository implements IPriceMatchRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async submitClaim(data: PriceMatchClaimSubmission): Promise<PriceMatchClaimResult> {
    logger.info('Submitting price match claim via RPC', { variantId: data.variant_id });
    return this.db.rpc<PriceMatchClaimResult>('submit_price_match_claim', {
      p_variant_id: data.variant_id,
      p_competitor_url: data.competitor_url,
      p_competitor_price_cents: data.competitor_price_cents,
      p_competitor_currency: data.competitor_currency,
      p_display_currency: data.display_currency,
      p_screenshot_base64: data.screenshot_base64,
      p_screenshot_mime: data.screenshot_mime,
      p_user_id: data.user_id,
      p_guest_email: data.guest_email,
      p_fingerprint_hash: data.fingerprint_hash ?? null,
    });
  }

  async getUserClaims(userId: string): Promise<PriceMatchClaim[]> {
    return this.db.query<PriceMatchClaim>('price_match_claims', {
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: 20,
    });
  }

  async getConfig(): Promise<PriceMatchConfig | null> {
    const row = await this.db.queryOne<{ config_value: PriceMatchConfig }>('security_config', {
      eq: [['config_key', 'price_match_config']],
    });
    return row?.config_value ?? null;
  }

  async getClaimPromoCode(promoCodeId: string): Promise<string | null> {
    const row = await this.db.queryOne<{ code: string }>('promo_codes', {
      select: 'code',
      eq: [['id', promoCodeId]],
    });
    return row?.code ?? null;
  }
}
