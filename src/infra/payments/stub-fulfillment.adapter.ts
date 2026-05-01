import { injectable } from 'tsyringe';
import type { IFulfillmentService } from '../../core/ports/fulfillment-service.port.js';
import type { FulfillmentResult } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-fulfillment');

@injectable()
export class StubFulfillmentAdapter implements IFulfillmentService {
  async fulfill(orderId: string, riskScore?: number): Promise<FulfillmentResult> {
    logger.info('Stub fulfillment — returning success', { orderId, riskScore });

    return {
      fulfilled: true,
      order_id: orderId,
      keys_delivered: 1,
    };
  }

  async holdOrder(orderId: string, reason: string, riskScore: number): Promise<void> {
    logger.info('Stub hold order', { orderId, reason, riskScore });
  }
}
