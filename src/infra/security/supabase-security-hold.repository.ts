import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ISecurityHoldRepository } from '../../core/ports/security-hold-repository.port.js';
import type { CreateSecurityHoldParams } from '../../core/ports/security-hold-repository.port.js';
import type {
  SecurityHold,
  SecurityHoldStatus,
  SubmitHoldResponseDto,
} from '../../core/use-cases/security/security.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('security-hold-repository');

@injectable()
export class SupabaseSecurityHoldRepository implements ISecurityHoldRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async createHold(params: CreateSecurityHoldParams): Promise<{ id: string }> {
    return this.db.insert<{ id: string }>('security_holds', {
      order_id: params.order_id,
      user_id: params.user_id ?? null,
      guest_email: params.guest_email ?? null,
      risk_score: params.risk_score,
      risk_factors: params.risk_factors,
      hold_reason: params.hold_reason,
      status: params.status ?? 'pending_verification',
    });
  }

  async findById(holdId: string): Promise<SecurityHold | null> {
    return this.db.queryOne<SecurityHold>('security_holds', {
      eq: [['id', holdId]],
    });
  }

  async getStatus(holdId: string): Promise<SecurityHoldStatus | null> {
    const hold = await this.db.queryOne<{ status: string }>('security_holds', {
      eq: [['id', holdId]],
    });
    return hold?.status ?? null;
  }

  async submitResponse(holdId: string, dto: SubmitHoldResponseDto): Promise<void> {
    await this.db.update('security_holds', { id: holdId }, {
      customer_responses: dto.responses,
      evidence_urls: dto.evidence_urls,
      status: 'responded',
    });
  }

  async checkRateLimit(
    identifier: string,
    identifierType: string,
    actionType: string,
  ): Promise<boolean> {
    const result = await this.db.rpc<{ allowed: boolean }>('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
    });
    return result?.allowed ?? true;
  }

  async recordAttempt(
    identifier: string,
    identifierType: string,
    actionType: string,
  ): Promise<void> {
    await this.db.rpc('record_rate_limit_attempt', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
    });
  }

  async checkVerificationRateLimit(
    identifier: string,
    identifierType: string,
    actionType: string,
  ): Promise<boolean> {
    const result = await this.db.rpc<boolean>('check_verification_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
    });
    return result === true;
  }

  async recordVerificationAttempt(
    identifier: string,
    identifierType: string,
    actionType: string,
  ): Promise<void> {
    await this.db.rpc('record_verification_attempt', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
    });
  }

  async resolveByToken(token: string): Promise<{ success: boolean; error?: string }> {
    logger.info('Resolving security hold by unlock token');

    const hold = await this.db.queryOne<SecurityHold>('security_holds', {
      eq: [['unlock_token', token]],
    });

    if (!hold) {
      return { success: false, error: 'Invalid or expired unlock token' };
    }

    if (hold.status === 'resolved') {
      return { success: false, error: 'Account already unlocked' };
    }

    await this.db.update('security_holds', { id: hold.id }, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_method: 'unlock_token',
    });

    return { success: true };
  }
}
