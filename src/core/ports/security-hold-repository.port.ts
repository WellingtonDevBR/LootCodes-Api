import type { SecurityHold, SecurityHoldStatus, SubmitHoldResponseDto } from '../use-cases/security/security.types.js';

export interface ISecurityHoldRepository {
  findById(holdId: string): Promise<SecurityHold | null>;
  getStatus(holdId: string): Promise<SecurityHoldStatus | null>;
  submitResponse(holdId: string, dto: SubmitHoldResponseDto): Promise<void>;
  checkRateLimit(identifier: string, identifierType: string, actionType: string): Promise<boolean>;
  recordAttempt(identifier: string, identifierType: string, actionType: string): Promise<void>;
  resolveByToken(token: string): Promise<{ success: boolean; error?: string }>;
}
