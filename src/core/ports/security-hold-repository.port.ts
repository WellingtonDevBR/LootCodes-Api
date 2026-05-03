import type { SecurityHold, SecurityHoldStatus, SubmitHoldResponseDto } from '../use-cases/security/security.types.js';

export interface CreateSecurityHoldParams {
  order_id: string;
  user_id?: string | null;
  guest_email?: string | null;
  risk_score: number;
  risk_factors: string[];
  hold_reason: string;
  status?: string;
}

export interface ISecurityHoldRepository {
  findById(holdId: string): Promise<SecurityHold | null>;
  getStatus(holdId: string): Promise<SecurityHoldStatus | null>;
  createHold(params: CreateSecurityHoldParams): Promise<{ id: string }>;
  submitResponse(holdId: string, dto: SubmitHoldResponseDto): Promise<void>;
  checkRateLimit(identifier: string, identifierType: string, actionType: string): Promise<boolean>;
  recordAttempt(identifier: string, identifierType: string, actionType: string): Promise<void>;
  checkVerificationRateLimit(identifier: string, identifierType: string, actionType: string): Promise<boolean>;
  recordVerificationAttempt(identifier: string, identifierType: string, actionType: string): Promise<void>;
  resolveByToken(token: string): Promise<{ success: boolean; error?: string }>;
}
