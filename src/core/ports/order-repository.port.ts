import type { Order, OrderItem, OrderDetail, PaginationParams } from '../services/orders/order.types.js';

export interface IOrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByUserId(userId: string, pagination?: PaginationParams): Promise<Order[]>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderDetail(orderId: string): Promise<OrderDetail | null>;
  findByUserForSupport(userId: string): Promise<Order[]>;
}
