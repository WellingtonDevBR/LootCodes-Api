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
    return this.db.queryOne<ApprovalTokenResult>('security_holds', {
      select: 'id, guest_email, approval_token_expires, approval_token_used, status, pending_order_data',
      eq: [['id', holdId], ['approval_token', token], ['status', 'approved']],
    });
  }
}
