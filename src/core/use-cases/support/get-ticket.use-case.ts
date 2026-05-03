import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { IDatabase } from '../../ports/database.port.js';
import type { TicketDetail } from './support.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';

export interface GetTicketOptions {
  userId?: string;
  userEmail?: string;
  email?: string;
}

export interface GetTicketResult {
  success: boolean;
  ticket: Record<string, unknown>;
}

@injectable()
export class GetTicketUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(ticketNumber: string, options: GetTicketOptions = {}): Promise<GetTicketResult> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    const { userId, userEmail, email } = options;
    const effectiveEmail = email || userEmail;

    const allowed = await this.checkAccess(detail.ticket, userId, effectiveEmail);
    if (!allowed) {
      throw new NotFoundError('Ticket not found');
    }

    if (userId && !detail.ticket.user_id && effectiveEmail) {
      const ticketGuestEmail = detail.ticket.guest_email?.trim().toLowerCase();
      const callerEmail = effectiveEmail.trim().toLowerCase();
      if (ticketGuestEmail && ticketGuestEmail === callerEmail) {
        await this.ticketRepo.autoLinkUser(detail.ticket.id, userId);
        detail.ticket.user_id = userId;
      }
    }

    const filteredMessages = (detail.messages ?? []).filter(m => !m.is_internal);

    const customerEmail = this.resolveCustomerEmail(detail);
    const customerName = detail.ticket.customer_name ?? null;

    const ticketResponse = {
      ...detail.ticket,
      customer_email: customerEmail,
      customer_name: customerName,
      messages: filteredMessages,
      attachments: detail.attachments ?? [],
      order: detail.order ?? null,
    };

    return { success: true, ticket: ticketResponse };
  }

  private async checkAccess(
    ticket: { user_id?: string; guest_email?: string; order_id?: string | null; customer_email?: string | null; order_contact_email?: string | null },
    userId?: string,
    email?: string,
  ): Promise<boolean> {
    if (userId && ticket.user_id && ticket.user_id === userId) {
      return true;
    }

    if (userId && ticket.order_id) {
      const ownerOrder = await this.db.queryOne<{ id: string }>('orders', {
        select: 'id',
        eq: [['id', ticket.order_id], ['user_id', userId]],
      });
      if (ownerOrder) return true;
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      if (ticket.guest_email && ticket.guest_email.trim().toLowerCase() === normalizedEmail) {
        return true;
      }

      if (ticket.customer_email && ticket.customer_email.trim().toLowerCase() === normalizedEmail) {
        return true;
      }

      if (ticket.order_contact_email && ticket.order_contact_email.trim().toLowerCase() === normalizedEmail) {
        return true;
      }
    }

    return false;
  }

  private resolveCustomerEmail(detail: TicketDetail): string | null {
    const ticket = detail.ticket;
    const order = detail.order;

    return (
      ticket.customer_email ??
      ticket.order_contact_email ??
      ticket.guest_email ??
      order?.contact_email ??
      order?.delivery_email ??
      order?.guest_email ??
      null
    );
  }
}
