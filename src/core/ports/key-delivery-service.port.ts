import type { ProductKey } from '../services/orders/order.types.js';

export interface IKeyDeliveryService {
  getKeysForOrder(orderId: string, userId: string): Promise<ProductKey[]>;
  getKeysForOrderItem(orderItemId: string, userId: string): Promise<ProductKey[]>;
  revealKey(keyId: string, orderId: string, userId: string, ipAddress: string, userAgent: string): Promise<string>;
  checkKeyViewed(keyId: string, orderId: string, userId: string): Promise<boolean>;
}
