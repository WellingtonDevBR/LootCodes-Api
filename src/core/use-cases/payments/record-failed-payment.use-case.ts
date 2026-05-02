import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IDatabase } from '../../ports/database.port.js';

export interface RecordFailedPaymentDto {
  payment_intent_id: string;
  amount: number;
  currency: string;
  decline_code?: string | null;
  failure_reason: string;
  card_brand?: string | null;
  card_last4?: string | null;
  card_country?: string | null;
  user_id?: string | null;
  guest_email?: string | null;
  payment_method_data?: Record<string, unknown>;
}

@injectable()
export class RecordFailedPaymentUseCase {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(dto: RecordFailedPaymentDto): Promise<void> {
    await this.db.query(
      `INSERT INTO payment_attempts (
        payment_intent_id, amount, currency, decline_code, failure_reason,
        card_brand, card_last4, card_country, user_id, guest_email, payment_method_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        dto.payment_intent_id,
        dto.amount,
        dto.currency,
        dto.decline_code ?? null,
        dto.failure_reason,
        dto.card_brand ?? null,
        dto.card_last4 ?? null,
        dto.card_country ?? null,
        dto.user_id ?? null,
        dto.guest_email ?? null,
        JSON.stringify(dto.payment_method_data ?? {}),
      ],
    );
  }
}
