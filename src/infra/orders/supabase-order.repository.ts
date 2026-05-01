import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IOrderRepository } from '../../core/ports/order-repository.port.js';
import type { Order, OrderItem, OrderDetail, PaginationParams } from '../../core/use-cases/orders/order.types.js';

@injectable()
export class SupabaseOrderRepository implements IOrderRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async findById(orderId: string): Promise<Order | null> {
    return this.db.queryOne<Order>('orders', {
      eq: [['id', orderId]],
    });
  }

  async findByUserId(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    return this.db.query<Order>('orders', {
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: pagination?.limit ?? 50,
    });
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.db.query<OrderItem>('order_items', {
      eq: [['order_id', orderId]],
    });
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    const order = await this.findById(orderId);
    if (!order) return null;

    const items = await this.getOrderItems(orderId);
    return { order, items };
  }

  async findByUserForSupport(userId: string): Promise<Order[]> {
    return this.db.query<Order>('orders', {
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: 100,
    });
  }
}
