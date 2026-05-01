import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ISecurityHoldRepository } from '../../core/ports/security-hold-repository.port.js';
import type {
  SecurityHold,
  SecurityHoldStatus,
  SubmitHoldResponseDto,
} from '../../core/services/security/security.types.js';

@injectable()
export class SupabaseSecurityHoldRepository implements ISecurityHoldRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

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
}
