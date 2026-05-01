import type { ProductKey, KeyViewLog } from '../services/orders/order.types.js';

export interface IProductKeyRepository {
  getKeysForOrder(orderId: string, userId: string): Promise<ProductKey[]>;
  getKeysForOrderItem(orderItemId: string): Promise<ProductKey[]>;
  decryptKey(keyId: string): Promise<string>;
  logKeyView(log: KeyViewLog): Promise<void>;
  checkKeyViewed(keyId: string, orderId: string, userId: string): Promise<boolean>;
}
