import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ICheckoutRepository, CreateOrderParams } from '../../core/ports/checkout-repository.port.js';

@injectable()
export class SupabaseCheckoutRepository implements ICheckoutRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async createOrder(params: CreateOrderParams): Promise<{ id: string }> {
    const result = await this.db.insert<{ id: string }>('orders', {
      user_id: params.user_id ?? null,
      session_id: params.session_id ?? null,
      total_cents: params.total_cents,
      currency: params.currency,
      payment_intent_id: params.payment_intent_id,
      promo_code: params.promo_code ?? null,
      status: 'pending',
    });

    return { id: result.id };
  }

  async updateOrder(orderId: string, data: Record<string, unknown>): Promise<void> {
    await this.db.update('orders', { id: orderId }, data);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.db.update('orders', { id: orderId }, { status: 'cancelled' });
  }

  async getOrder(orderId: string): Promise<Record<string, unknown> | null> {
    return this.db.queryOne<Record<string, unknown>>('orders', {
      eq: [['id', orderId]],
    });
  }
}
