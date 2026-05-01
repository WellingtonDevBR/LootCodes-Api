import type { FulfillmentResult } from '../services/payments/payment.types.js';

export interface IFulfillmentService {
  fulfill(orderId: string, riskScore?: number): Promise<FulfillmentResult>;
  holdOrder(orderId: string, reason: string, riskScore: number): Promise<void>;
}
