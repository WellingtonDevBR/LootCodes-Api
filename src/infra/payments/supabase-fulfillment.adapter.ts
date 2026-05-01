import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IFulfillmentService } from '../../core/ports/fulfillment-service.port.js';
import type { IEventBus } from '../../core/ports/event-bus.port.js';
import type { FulfillmentResult } from '../../core/use-cases/payments/payment.types.js';
import { NotFoundError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('fulfillment');

const FULFILLABLE_STATUSES = new Set(['paid', 'pending']);

interface OrderRow {
  id: string;
  status: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
}

@injectable()
export class SupabaseFulfillmentAdapter implements IFulfillmentService {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.EventBus) private eventBus: IEventBus,
  ) {}

  async fulfill(orderId: string, riskScore?: number): Promise<FulfillmentResult> {
    const done = logger.startOperation('fulfill-order', { orderId, riskScore });

    try {
      const order = await this.db.queryOne<OrderRow>('orders', {
        eq: [['id', orderId]],
      });

      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      if (!FULFILLABLE_STATUSES.has(order.status)) {
        logger.warn('Order not in fulfillable status', { orderId, status: order.status });
        return { fulfilled: false, order_id: orderId };
      }

      const items = await this.db.query<OrderItemRow>('order_items', {
        eq: [['order_id', orderId]],
      });

      let totalKeysAllocated = 0;
      const affectedVariantIds = new Set<string>();

      for (const item of items) {
        const allocated = await this.allocateKeysForItem(item);
        totalKeysAllocated += allocated;
        if (allocated > 0) {
          affectedVariantIds.add(item.variant_id);
        }
      }

      await this.db.update('orders', { id: orderId }, {
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      for (const variantId of affectedVariantIds) {
        await this.eventBus.emit({
          eventType: 'inventory.stock_changed',
          aggregateType: 'variant',
          aggregateId: variantId,
          payload: { order_id: orderId, variant_id: variantId },
        });
      }

      done();
      return { fulfilled: true, order_id: orderId, keys_delivered: totalKeysAllocated };
    } catch (err) {
      logger.error('Fulfillment failed', err, { orderId });
      if (err instanceof NotFoundError) throw err;
      return { fulfilled: false, order_id: orderId };
    }
  }

  async holdOrder(orderId: string, reason: string, riskScore: number): Promise<void> {
    logger.info('Holding order', { orderId, reason, riskScore });

    await this.db.update('orders', { id: orderId }, {
      status: 'held',
      updated_at: new Date().toISOString(),
    });

    await this.db.insert('security_holds', {
      order_id: orderId,
      reason,
      risk_score: riskScore,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    await this.eventBus.emit({
      eventType: 'order.held',
      aggregateType: 'order',
      aggregateId: orderId,
      payload: { order_id: orderId, reason },
    });
  }

  private async allocateKeysForItem(item: OrderItemRow): Promise<number> {
    const availableKeys = await this.db.query<{ id: string }>('product_keys', {
      eq: [['variant_id', item.variant_id], ['status', 'available']],
      limit: item.quantity,
    });

    if (availableKeys.length === 0) {
      logger.warn('No available keys for variant', { variantId: item.variant_id, orderId: item.order_id });
      return 0;
    }

    const now = new Date().toISOString();

    for (const key of availableKeys) {
      await this.db.update('product_keys', { id: key.id }, {
        status: 'sold',
        order_id: item.order_id,
        order_item_id: item.id,
        sold_at: now,
      });
    }

    return availableKeys.length;
  }
}
