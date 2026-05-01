export interface WalletBalance {
  balance_cents: number;
  lifetime_credited_cents: number;
  lifetime_redeemed_cents: number;
  expiring_soon_cents: number;
  next_expiry: string | null;
}

export interface WalletLedgerEntry {
  id: string;
  amount_cents: number;
  reason: string;
  order_id?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export interface LedgerPaginationParams {
  limit?: number;
  before?: string;
}

export interface OrderEarnings {
  order_id: string;
  earned_cents: number;
  reward_cents: number;
  referral_cents: number;
  reward_expires_at: string | null;
  reasons: string[];
}
