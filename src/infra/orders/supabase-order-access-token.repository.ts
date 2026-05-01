import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IOrderAccessTokenRepository } from '../../core/ports/order-access-token-repository.port.js';
import type { OrderAccessToken } from '../../core/use-cases/orders/order.types.js';

@injectable()
export class SupabaseOrderAccessTokenRepository implements IOrderAccessTokenRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async validate(token: string, orderId: string): Promise<OrderAccessToken | null> {
    return this.db.queryOne<OrderAccessToken>('order_access_tokens', {
      eq: [['token', token], ['order_id', orderId]],
    });
  }

  async generate(orderId: string, email: string): Promise<OrderAccessToken> {
    return this.db.rpc<OrderAccessToken>('generate_order_access_token', {
      p_order_id: orderId,
      p_email: email,
    });
  }

  async refresh(token: string): Promise<OrderAccessToken> {
    return this.db.rpc<OrderAccessToken>('refresh_order_access_token', {
      p_token: token,
    });
  }

  async claimToUser(token: string, userId: string): Promise<void> {
    await this.db.rpc('claim_guest_order', {
      p_token: token,
      p_user_id: userId,
    });
  }
}
