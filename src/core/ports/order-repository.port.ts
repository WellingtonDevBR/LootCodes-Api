import type {
  Order, OrderItem, OrderDetail, PaginationParams,
  UserOrderWithRelations, OrderAccessResponse, OrderAccessTokenMetadata,
  OrderForVerification, OrderItemForTicket, UserOrderForSupport, ProductKeyLookup,
} from '../use-cases/orders/order.types.js';

export interface IOrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByUserId(userId: string, pagination?: PaginationParams): Promise<Order[]>;
  findByUserIdWithRelations(userId: string, pagination?: PaginationParams): Promise<UserOrderWithRelations[]>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderDetail(orderId: string): Promise<OrderDetail | null>;
  getOrderAccessDetail(orderId: string): Promise<OrderAccessResponse | null>;
  getKeyViewLogs(orderId: string, keyIds: string[]): Promise<Array<{ key_id: string; viewed_at: string }>>;
  getOrderAccessTokenMetadata(token: string, orderId: string): Promise<OrderAccessTokenMetadata | null>;
  findByUserForSupport(userId: string): Promise<Order[]>;
  findForVerification(orderId: string): Promise<OrderForVerification | null>;
  getProductKeyLookup(productKeyId: string): Promise<ProductKeyLookup | null>;
  findOrderItemId(orderId: string, variantId: string): Promise<string | null>;
  getOrderItemsForTicket(orderId: string): Promise<OrderItemForTicket[]>;
  getUserOrdersForSupport(userId: string): Promise<UserOrderForSupport[]>;
}
