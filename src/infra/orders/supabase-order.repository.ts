import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IOrderRepository } from '../../core/ports/order-repository.port.js';
import type {
  Order, OrderItem, OrderDetail, PaginationParams,
  UserOrderWithRelations, OrderAccessResponse, OrderAccessTokenMetadata,
  OrderForVerification, OrderItemForTicket, UserOrderForSupport, ProductKeyLookup,
} from '../../core/use-cases/orders/order.types.js';

const USER_ORDERS_SELECT = `
  id, order_number, status, fulfillment_status, refund_status, refunded_at,
  keys_revealed_at, total_amount, currency, created_at, promo_code_id,
  discount_amount_cents,
  order_items(
    id, quantity, activation_instructions, variant_id, status,
    created_at, unit_price,
    products(name, platform),
    product_variants(id,
      variant_platforms(product_platforms(name)),
      product_regions(name)
    )
  ),
  product_keys(id, is_used, used_at, variant_id),
  order_item_price_adjustments(
    order_item_id, refund_cents, original_cents,
    adjusted_cents, currency, created_at
  )
`.replace(/\s+/g, ' ').trim();

const ORDER_VERIFICATION_SELECT =
  'id, order_number, total_amount, currency, status, fulfillment_status, delivery_email, guest_email, user_id, created_at, keys_revealed_at, refund_status, processing_status, customer_full_name, billing_country_code, ip_country';

const ORDER_ITEMS_FOR_TICKET_SELECT = `
  id,
  order_items(
    id, quantity,
    products(name),
    product_variants(variant_platforms(product_platforms(name)))
  )
`.replace(/\s+/g, ' ').trim();

const USER_ORDERS_FOR_SUPPORT_SELECT = `
  id, order_number, created_at, total_amount, currency,
  order_items(
    id, quantity,
    products(name),
    product_variants(variant_platforms(product_platforms(name)))
  )
`.replace(/\s+/g, ' ').trim();

const ORDER_ACCESS_SELECT = `
  id, order_number, total_amount, currency, status, fulfillment_status,
  refund_status, delivery_email, guest_email, customer_full_name,
  user_id, created_at, keys_revealed_at, discount_amount_cents, promo_code_id,
  order_items(
    id, status, quantity, unit_price, total_price, activation_instructions,
    products(id, name, slug, image_url, release_date, expected_delivery_date),
    product_variants(
      id, sku, face_value, release_date, activation_instructions,
      product_regions(code, name),
      variant_platforms(product_platforms(code, name, key_display_label, redemption_url_template))
    )
  ),
  product_keys(id, variant_id, is_used, is_assigned, created_at, first_revealed_at, key_state)
`.replace(/\s+/g, ' ').trim();

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

  async findByUserIdWithRelations(userId: string, pagination?: PaginationParams): Promise<UserOrderWithRelations[]> {
    return this.db.query<UserOrderWithRelations>('orders', {
      select: USER_ORDERS_SELECT,
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

  async getOrderAccessDetail(orderId: string): Promise<OrderAccessResponse | null> {
    const rows = await this.db.query<OrderAccessResponse['order']>('orders', {
      select: ORDER_ACCESS_SELECT,
      eq: [['id', orderId]],
      limit: 1,
    });
    const row = rows[0];
    if (!row) return null;

    const productKeys = (row as unknown as Record<string, unknown>).product_keys;
    const order = { ...row };
    delete (order as Record<string, unknown>).product_keys;

    return {
      order,
      product_keys: (productKeys ?? []) as OrderAccessResponse['product_keys'],
    };
  }

  async getKeyViewLogs(orderId: string, keyIds: string[]): Promise<Array<{ key_id: string; viewed_at: string }>> {
    if (!keyIds.length) return [];
    return this.db.query<{ key_id: string; viewed_at: string }>('key_view_logs', {
      select: 'key_id, viewed_at',
      eq: [['order_id', orderId]],
      in: [['key_id', keyIds]],
    });
  }

  async getOrderAccessTokenMetadata(token: string, orderId: string): Promise<OrderAccessTokenMetadata | null> {
    try {
      const result = await this.db.rpc<OrderAccessTokenMetadata>('get_order_access_token_metadata', {
        p_token: token,
        p_order_id: orderId,
      });
      return result ?? null;
    } catch {
      return null;
    }
  }

  async findForVerification(orderId: string): Promise<OrderForVerification | null> {
    return this.db.queryOne<OrderForVerification>('orders', {
      select: ORDER_VERIFICATION_SELECT,
      eq: [['id', orderId]],
    });
  }

  async getProductKeyLookup(productKeyId: string): Promise<ProductKeyLookup | null> {
    return this.db.queryOne<ProductKeyLookup>('product_keys', {
      select: 'order_id, variant_id',
      eq: [['id', productKeyId]],
    });
  }

  async findOrderItemId(orderId: string, variantId: string): Promise<string | null> {
    const row = await this.db.queryOne<{ id: string }>('order_items', {
      select: 'id',
      eq: [['order_id', orderId], ['variant_id', variantId]],
    });
    return row?.id ?? null;
  }

  async getOrderItemsForTicket(orderId: string): Promise<OrderItemForTicket[]> {
    const rows = await this.db.query<Record<string, unknown>>('orders', {
      select: ORDER_ITEMS_FOR_TICKET_SELECT,
      eq: [['id', orderId]],
      limit: 1,
    });

    const order = rows[0];
    if (!order?.order_items) return [];

    return (order.order_items as Record<string, unknown>[]).map((item) => {
      const vp = (item.product_variants as Record<string, unknown>)
        ?.variant_platforms as Array<{ product_platforms?: { name?: string } }> | undefined;
      const platformNames = vp?.map(v => v.product_platforms?.name).filter(Boolean);
      return {
        id: item.id as string,
        product_name: ((item.products as Record<string, unknown>)?.name as string) || 'Unknown Product',
        platform_name: platformNames?.length ? platformNames.join(' / ') : '',
        quantity: (item.quantity as number) ?? 0,
      };
    });
  }

  async getUserOrdersForSupport(userId: string): Promise<UserOrderForSupport[]> {
    const rows = await this.db.query<Record<string, unknown>>('orders', {
      select: USER_ORDERS_FOR_SUPPORT_SELECT,
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: 20,
    });

    return rows.map((order) => ({
      id: order.id as string,
      order_number: order.order_number as string,
      created_at: order.created_at as string,
      total_amount: order.total_amount as number,
      currency: order.currency as string,
      order_items: ((order.order_items as Record<string, unknown>[]) || []).map((item) => {
        const vp = (item.product_variants as Record<string, unknown>)
          ?.variant_platforms as Array<{ product_platforms?: { name?: string } }> | undefined;
        const platformNames = vp?.map(v => v.product_platforms?.name).filter(Boolean);
        return {
          id: item.id as string,
          product_name: ((item.products as Record<string, unknown>)?.name as string) || 'Unknown Product',
          platform_name: platformNames?.length ? platformNames.join(' / ') : '',
          quantity: (item.quantity as number) ?? 0,
        };
      }),
    }));
  }
}
