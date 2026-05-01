import type { OrderAccessToken } from '../services/orders/order.types.js';

export interface IOrderAccessTokenRepository {
  validate(token: string, orderId: string): Promise<OrderAccessToken | null>;
  generate(orderId: string, email: string): Promise<OrderAccessToken>;
  refresh(token: string): Promise<OrderAccessToken>;
  claimToUser(token: string, userId: string): Promise<void>;
}
