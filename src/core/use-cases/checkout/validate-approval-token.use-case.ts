import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IDatabase } from '../../ports/database.port.js';

export interface ApprovalTokenResult {
  id: string;
  guest_email: string | null;
  approval_token_expires: string | null;
  approval_token_used: boolean | null;
  status: string;
  pending_order_data: Record<string, unknown> | null;
}

@injectable()
export class ValidateApprovalTokenUseCase {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(holdId: string, token: string): Promise<ApprovalTokenResult | null> {
    const result = await this.db.query<ApprovalTokenResult>(
      `SELECT id, guest_email, approval_token_expires, approval_token_used, status, pending_order_data
       FROM security_holds
       WHERE id = $1 AND approval_token = $2 AND status = 'approved'
       LIMIT 1`,
      [holdId, token],
    );
    return result[0] ?? null;
  }
}
