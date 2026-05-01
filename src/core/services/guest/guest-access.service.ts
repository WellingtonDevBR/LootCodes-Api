import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository } from '../../ports/guest-session.port.js';
import type { IOrderService } from '../../ports/order-service.port.js';
import type { IKeyDeliveryService } from '../../ports/key-delivery-service.port.js';
import type { ISupportService } from '../../ports/support-service.port.js';
import type { IGuestAccessService } from '../../ports/guest-access-service.port.js';
import type { OrderDetail, ProductKey } from '../orders/order.types.js';
import type { SupportTicket, CreateTicketDto } from '../support/support.types.js';
import { AuthenticationError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('guest-access-service');

@injectable()
export class GuestAccessService implements IGuestAccessService {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
    @inject(TOKENS.OrderService) private orderService: IOrderService,
    @inject(TOKENS.KeyDeliveryService) private keyDeliveryService: IKeyDeliveryService,
    @inject(TOKENS.SupportService) private supportService: ISupportService,
  ) {}

  async getGuestOrder(token: string, orderId: string): Promise<OrderDetail> {
    const session = await this.validateAndAuthorize(token, orderId);
    logger.info('Guest accessing order', { orderId, email: session.email });
    return this.orderService.getOrderDetail(orderId, session.email);
  }

  async getGuestOrderKeys(token: string, orderId: string): Promise<ProductKey[]> {
    const session = await this.validateAndAuthorize(token, orderId);
    logger.info('Guest accessing order keys', { orderId, email: session.email });
    return this.keyDeliveryService.getKeysForOrder(orderId, session.email);
  }

  async revealGuestKey(
    token: string,
    orderId: string,
    keyId: string,
    clientIP: string,
    userAgent: string,
  ): Promise<string> {
    const session = await this.validateAndAuthorize(token, orderId);
    logger.info('Guest revealing key', { orderId, keyId, email: session.email });
    return this.keyDeliveryService.revealKey(keyId, orderId, session.email, clientIP, userAgent);
  }

  async createGuestSupportTicket(token: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const session = await this.validateSession(token);
    const ticketDto: CreateTicketDto = {
      ...dto,
      guest_email: session.email,
      order_id: dto.order_id ?? session.order_id,
    };
    logger.info('Guest creating support ticket', { email: session.email, subject: dto.subject });
    return this.supportService.createTicket(ticketDto);
  }

  private async validateSession(token: string) {
    const session = await this.guestSessionRepo.validateToken(token);
    if (!session) {
      throw new AuthenticationError('Invalid or expired guest session');
    }
    return session;
  }

  private async validateAndAuthorize(token: string, orderId: string) {
    const session = await this.validateSession(token);
    if (session.order_id !== orderId) {
      logger.warn('Guest order ID mismatch', { expected: session.order_id, received: orderId });
      throw new ForbiddenError('You do not have access to this order');
    }
    return session;
  }
}
