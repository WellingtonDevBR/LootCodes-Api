import type { Order, OrderDetail, PaginationParams } from '../services/orders/order.types.js';

export interface IOrderService {
  getOrder(orderId: string, userId: string): Promise<Order>;
  getOrderDetail(orderId: string, userId: string): Promise<OrderDetail>;
  getUserOrders(userId: string, pagination?: PaginationParams): Promise<Order[]>;
  getUserOrdersForSupport(userId: string): Promise<Order[]>;
  validateAccessToken(token: string, orderId: string): Promise<boolean>;
  claimGuestOrder(token: string, userId: string): Promise<void>;
}
