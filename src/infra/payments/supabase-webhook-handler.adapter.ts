import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IWebhookHandler } from '../../core/ports/webhook-handler.port.js';
import type { IFulfillmentService } from '../../core/ports/fulfillment-service.port.js';
import type { IEventBus } from '../../core/ports/event-bus.port.js';
import type { WebhookEvent, WebhookProcessResult } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('webhook-handler');

@injectable()
export class SupabaseWebhookHandlerAdapter implements IWebhookHandler {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.FulfillmentService) private fulfillmentService: IFulfillmentService,
    @inject(TOKENS.EventBus) private eventBus: IEventBus,
  ) {}

  async processEvent(event: WebhookEvent): Promise<WebhookProcessResult> {
    try {
      const existing = await this.db.queryOne<{ id: string }>('webhook_events', {
        eq: [['id', event.id]],
      });

      if (existing) {
        logger.info('Webhook event already processed, skipping', { eventId: event.id });
        return { processed: true, event_id: event.id, action_taken: 'already_processed' };
      }

      const result = await this.routeEvent(event);

      await this.db.insert('webhook_events', {
        id: event.id,
        type: event.type,
        provider: event.provider,
        processed_at: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      logger.error('Failed to process webhook event', err, { eventId: event.id, eventType: event.type });
      return { processed: false, event_id: event.id };
    }
  }

  private async routeEvent(event: WebhookEvent): Promise<WebhookProcessResult> {
    switch (event.type) {
      // Stripe events
      case 'payment_intent.succeeded':
        return this.handlePaymentSucceeded(event);
      case 'charge.refunded':
        return this.handleChargeRefunded(event);
      case 'charge.dispute.created':
        return this.handleDisputeCreated(event);

      // PayPal events (normalised type names match Edge Function conventions)
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED':
        return this.handlePaymentSucceeded(this.normalizePayPalPaymentEvent(event));
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED':
        return this.handleChargeRefunded(this.normalizePayPalRefundEvent(event));
      case 'CUSTOMER.DISPUTE.CREATED':
        return this.handleDisputeCreated(this.normalizePayPalDisputeEvent(event));
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        return this.handlePayPalPaymentFailed(event);

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type, eventId: event.id });
        return { processed: true, event_id: event.id, action_taken: 'unhandled_event_type' };
    }
  }

  private async handlePaymentSucceeded(event: WebhookEvent): Promise<WebhookProcessResult> {
    const metadata = event.payload.metadata as Record<string, unknown> | undefined;
    const orderId = metadata?.order_id as string | undefined;

    if (!orderId) {
      logger.warn('payment_intent.succeeded missing order_id in metadata', { eventId: event.id });
      return { processed: true, event_id: event.id, action_taken: 'missing_order_id' };
    }

    await this.fulfillmentService.fulfill(orderId);

    await this.db.update('orders', { id: orderId }, {
      status: 'paid',
      updated_at: new Date().toISOString(),
    });

    await this.eventBus.emit({
      eventType: 'order.paid',
      aggregateType: 'order',
      aggregateId: orderId,
      payload: { order_id: orderId },
    });

    logger.info('Order fulfilled via payment_intent.succeeded', { orderId, eventId: event.id });
    return { processed: true, event_id: event.id, action_taken: 'order_fulfilled' };
  }

  private async handleChargeRefunded(event: WebhookEvent): Promise<WebhookProcessResult> {
    const metadata = event.payload.metadata as Record<string, unknown> | undefined;
    const orderId = metadata?.order_id as string | undefined;

    if (!orderId) {
      logger.warn('charge.refunded missing order_id in metadata', { eventId: event.id });
      return { processed: true, event_id: event.id, action_taken: 'missing_order_id' };
    }

    await this.db.update('orders', { id: orderId }, {
      status: 'refunded',
      updated_at: new Date().toISOString(),
    });

    await this.eventBus.emit({
      eventType: 'order.refunded',
      aggregateType: 'order',
      aggregateId: orderId,
      payload: { order_id: orderId },
    });

    logger.info('Order refunded via charge.refunded', { orderId, eventId: event.id });
    return { processed: true, event_id: event.id, action_taken: 'order_refunded' };
  }

  private async handleDisputeCreated(event: WebhookEvent): Promise<WebhookProcessResult> {
    const metadata = event.payload.metadata as Record<string, unknown> | undefined;
    const orderId = metadata?.order_id as string | undefined;

    if (!orderId) {
      logger.warn('charge.dispute.created missing order_id in metadata', { eventId: event.id });
      return { processed: true, event_id: event.id, action_taken: 'missing_order_id' };
    }

    await this.db.update('orders', { id: orderId }, {
      status: 'disputed',
      updated_at: new Date().toISOString(),
    });

    await this.fulfillmentService.holdOrder(orderId, 'Dispute opened', 100);

    await this.eventBus.emit({
      eventType: 'order.disputed',
      aggregateType: 'order',
      aggregateId: orderId,
      payload: { order_id: orderId },
    });

    logger.info('Order disputed via charge.dispute.created', { orderId, eventId: event.id });
    return { processed: true, event_id: event.id, action_taken: 'order_disputed' };
  }

  // ── PayPal event normalisers ──────────────────────────────────────────
  // PayPal webhook payloads carry the order_id in `resource.custom_id`
  // (purchase unit level) or `resource.purchase_units[0].custom_id`.
  // We reshape them to match the Stripe-style metadata convention so
  // the shared handlers (handlePaymentSucceeded, handleChargeRefunded,
  // handleDisputeCreated) work unchanged.

  private normalizePayPalPaymentEvent(event: WebhookEvent): WebhookEvent {
    const resource = event.payload.resource as Record<string, unknown> | undefined;
    const orderId = this.extractPayPalOrderId(resource);
    return {
      ...event,
      type: 'payment_intent.succeeded',
      payload: { ...event.payload, metadata: { order_id: orderId ?? '' } },
    };
  }

  private normalizePayPalRefundEvent(event: WebhookEvent): WebhookEvent {
    const resource = event.payload.resource as Record<string, unknown> | undefined;
    const orderId = this.extractPayPalOrderId(resource);
    return {
      ...event,
      type: 'charge.refunded',
      payload: { ...event.payload, metadata: { order_id: orderId ?? '' } },
    };
  }

  private normalizePayPalDisputeEvent(event: WebhookEvent): WebhookEvent {
    const resource = event.payload.resource as Record<string, unknown> | undefined;
    const transactions = (resource?.disputed_transactions ?? []) as Array<Record<string, unknown>>;
    const orderId = transactions[0]?.custom ?? transactions[0]?.reference_id;
    return {
      ...event,
      type: 'charge.dispute.created',
      payload: { ...event.payload, metadata: { order_id: (orderId as string) ?? '' } },
    };
  }

  private async handlePayPalPaymentFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    const resource = event.payload.resource as Record<string, unknown> | undefined;
    const orderId = this.extractPayPalOrderId(resource);

    if (orderId) {
      await this.db.update('orders', { id: orderId }, {
        status: 'failed',
        updated_at: new Date().toISOString(),
      });
      logger.info('PayPal payment failed', { orderId, eventId: event.id, eventType: event.type });
    } else {
      logger.warn('PayPal payment failed event missing order_id', { eventId: event.id });
    }

    return { processed: true, event_id: event.id, action_taken: 'payment_failed' };
  }

  private extractPayPalOrderId(resource: Record<string, unknown> | undefined): string | undefined {
    if (!resource) return undefined;
    // PAYMENT.CAPTURE.* → resource is a capture
    if (typeof resource.custom_id === 'string' && resource.custom_id) return resource.custom_id;
    // CHECKOUT.ORDER.* → resource is an order with purchase_units
    const units = resource.purchase_units as Array<Record<string, unknown>> | undefined;
    const fromUnit = units?.[0]?.custom_id;
    if (typeof fromUnit === 'string' && fromUnit) return fromUnit;
    return undefined;
  }
}
