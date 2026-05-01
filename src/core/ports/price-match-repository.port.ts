import type { PriceMatchClaim, PriceMatchClaimSubmission, PriceMatchClaimResult, PriceMatchConfig } from '../use-cases/price-match/price-match.types.js';

export interface IPriceMatchRepository {
  submitClaim(data: PriceMatchClaimSubmission): Promise<PriceMatchClaimResult>;
  getUserClaims(userId: string): Promise<PriceMatchClaim[]>;
  getConfig(): Promise<PriceMatchConfig | null>;
  getClaimPromoCode(promoCodeId: string): Promise<string | null>;
}
