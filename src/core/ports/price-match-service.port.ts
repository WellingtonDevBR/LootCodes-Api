import type { PriceMatchClaim, PriceMatchClaimSubmission, PriceMatchClaimResult, PriceMatchConfig } from '../services/price-match/price-match.types.js';

export interface IPriceMatchService {
  submitClaim(data: PriceMatchClaimSubmission, clientIP: string): Promise<PriceMatchClaimResult>;
  getUserClaims(userId: string): Promise<PriceMatchClaim[]>;
  getConfig(): Promise<PriceMatchConfig | null>;
  getClaimPromoCode(userId: string, promoCodeId: string): Promise<string | null>;
}
