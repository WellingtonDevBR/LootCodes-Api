import type { IOrderRepository } from '../../src/core/ports/order-repository.port.js';
import type { Order, OrderItem, OrderDetail, PaginationParams, UserOrderWithRelations, OrderAccessResponse, OrderAccessTokenMetadata } from '../../src/core/use-cases/orders/order.types.js';

export function createMockOrderRepository(orders: Order[] = []): IOrderRepository {
  return {
    async findById(orderId: string): Promise<Order | null> {
      return orders.find((o) => o.id === orderId) ?? null;
    },
    async findByUserId(userId: string, _pagination?: PaginationParams): Promise<Order[]> {
      return orders.filter((o) => o.user_id === userId);
    },
    async findByUserIdWithRelations(_userId: string, _pagination?: PaginationParams): Promise<UserOrderWithRelations[]> {
      return [];
    },
    async getOrderItems(_orderId: string): Promise<OrderItem[]> {
      return [];
    },
    async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return null;
      return { order, items: [] };
    },
    async getOrderAccessDetail(_orderId: string): Promise<OrderAccessResponse | null> {
      return null;
    },
    async getKeyViewLogs(_orderId: string, _keyIds: string[]): Promise<Array<{ key_id: string; viewed_at: string }>> {
      return [];
    },
    async getOrderAccessTokenMetadata(_token: string, _orderId: string): Promise<OrderAccessTokenMetadata | null> {
      return null;
    },
    async findByUserForSupport(userId: string): Promise<Order[]> {
      return orders.filter((o) => o.user_id === userId);
    },
  };
}
