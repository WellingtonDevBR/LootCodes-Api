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
    await this.db.insert('payment_attempts', {
      payment_intent_id: dto.payment_intent_id,
      amount: dto.amount,
      currency: dto.currency,
      decline_code: dto.decline_code ?? null,
      failure_reason: dto.failure_reason,
      card_brand: dto.card_brand ?? null,
      card_last4: dto.card_last4 ?? null,
      card_country: dto.card_country ?? null,
      user_id: dto.user_id ?? null,
      guest_email: dto.guest_email ?? null,
      payment_method_data: dto.payment_method_data ?? {},
    });
  }
}
