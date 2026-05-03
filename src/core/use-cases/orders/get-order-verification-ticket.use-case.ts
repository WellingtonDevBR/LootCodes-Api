import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import { ForbiddenError, NotFoundError, AuthenticationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-order-verification-ticket');

export type OrderVerificationTicketQueryType = 'id_verification' | 'security_verification' | 'all';

export interface GetOrderVerificationTicketInput {
  orderId: string;
  /** Resolved from Supabase session JWT when `Authorization` is valid */
  sessionUserId?: string | undefined;
  /** Guest order-access token (header), validated against `order_access_tokens` */
  orderAccessToken?: string | undefined;
  queryType: OrderVerificationTicketQueryType;
}

export interface OrderVerificationTicketDto {
  id: string;
  ticket_number: string;
  status: string;
  ticket_type: string | null;
}

function ticketTypesForQuery(queryType: OrderVerificationTicketQueryType): string[] {
  if (queryType === 'id_verification') return ['id_verification'];
  if (queryType === 'security_verification') return ['security_verification'];
  return ['id_verification', 'security_verification'];
}

@injectable()
export class GetOrderVerificationTicketUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private readonly orderRepo: IOrderRepository,
    @inject(TOKENS.OrderAccessTokenRepository) private readonly accessTokenRepo: IOrderAccessTokenRepository,
    @inject(TOKENS.SupportTicketRepository) private readonly ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(input: GetOrderVerificationTicketInput): Promise<OrderVerificationTicketDto | null> {
    await this.assertCallerMayAccessOrder(input);

    const types = ticketTypesForQuery(input.queryType);
    const ticket = await this.ticketRepo.findVerificationTicketForOrder(input.orderId, types);

    if (!ticket) return null;

    return {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: ticket.status,
      ticket_type: ticket.ticket_type ?? null,
    };
  }

  private async assertCallerMayAccessOrder(input: GetOrderVerificationTicketInput): Promise<void> {
    const { sessionUserId, orderAccessToken, orderId } = input;

    if (sessionUserId) {
      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      const ownerId = order.user_id ?? null;
      if (ownerId !== sessionUserId) {
        logger.warn('Verification ticket lookup denied — user mismatch', { orderId, sessionUserId });
        throw new ForbiddenError('You do not have access to this order');
      }

      return;
    }

    if (orderAccessToken) {
      const valid = await this.accessTokenRepo.validate(orderAccessToken, orderId);
      if (!valid) {
        logger.warn('Verification ticket lookup denied — invalid order access token', { orderId });
        throw new ForbiddenError('Invalid or expired access');
      }
      return;
    }

    throw new AuthenticationError('Missing credentials');
  }
}
