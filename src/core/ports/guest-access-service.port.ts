import type { OrderDetail } from '../services/orders/order.types.js';
import type { SupportTicket, CreateTicketDto } from '../services/support/support.types.js';
import type { ProductKey } from '../services/orders/order.types.js';

export interface IGuestAccessService {
  getGuestOrder(token: string, orderId: string): Promise<OrderDetail>;
  getGuestOrderKeys(token: string, orderId: string): Promise<ProductKey[]>;
  revealGuestKey(token: string, orderId: string, keyId: string, clientIP: string, userAgent: string): Promise<string>;
  createGuestSupportTicket(token: string, dto: CreateTicketDto): Promise<SupportTicket>;
}
