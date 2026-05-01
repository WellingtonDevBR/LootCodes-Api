import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IProductKeyRepository } from '../../core/ports/product-key-repository.port.js';
import type { ProductKey, KeyViewLog, KeyAccessAttemptLog } from '../../core/use-cases/orders/order.types.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('product-key-repository');

@injectable()
export class SupabaseProductKeyRepository implements IProductKeyRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getKeysForOrder(orderId: string, userId: string): Promise<ProductKey[]> {
    return this.db.rpc<ProductKey[]>('get_keys_for_order', {
      p_order_id: orderId,
      p_user_id: userId,
    });
  }

  async getKeysForOrderItem(orderItemId: string): Promise<ProductKey[]> {
    return this.db.query<ProductKey>('product_keys', {
      eq: [['order_item_id', orderItemId]],
    });
  }

  async decryptKey(keyId: string): Promise<string> {
    const result = await this.db.rpc<string>('decrypt_product_key', {
      p_key_id: keyId,
    });

    if (!result) {
      throw new InternalError('Failed to decrypt product key');
    }

    return result;
  }

  async logKeyView(log: KeyViewLog): Promise<void> {
    await this.db.insert('key_view_logs', {
      key_id: log.key_id,
      order_id: log.order_id,
      user_id: log.user_id ?? null,
      ip_address: log.ip_address ?? null,
      user_agent: log.user_agent ?? null,
    });
  }

  async checkKeyViewed(keyId: string, orderId: string, userId: string): Promise<boolean> {
    const row = await this.db.queryOne('key_view_logs', {
      eq: [['key_id', keyId], ['order_id', orderId], ['user_id', userId]],
    });
    return row !== null;
  }

  async logAccessAttempt(params: KeyAccessAttemptLog): Promise<void> {
    logger.info('Logging key access attempt', { success: params.success, order_id: params.order_id });
    await this.db.insert('key_access_attempts', {
      token: params.token ?? null,
      order_id: params.order_id ?? null,
      email: params.email ?? null,
      success: params.success,
      failure_reason: params.failure_reason ?? null,
    });
  }
}
