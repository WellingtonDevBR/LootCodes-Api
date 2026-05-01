export interface CardChallenge {
  id: string;
  order_id: string;
  status: 'pending' | 'verified' | 'failed' | 'expired' | 'id_chosen';
  authorization_id?: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
}

export interface StartChallengeDto {
  order_id: string;
  payment_method_id: string;
  customer_id?: string;
}

export interface StartChallengeResult {
  challenge_id: string;
  status: string;
}

export interface VerifyChallengeDto {
  amount_cents: number;
}

export interface VerifyChallengeResult {
  verified: boolean;
  attempts_remaining: number;
}

export interface ChooseIdResult {
  ok: boolean;
  redirect_to?: string;
}
