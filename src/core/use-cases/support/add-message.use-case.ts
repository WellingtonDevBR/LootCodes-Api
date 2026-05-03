import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { IDatabase } from '../../ports/database.port.js';
import type { AddMessageDto } from './support.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('add-message');

export interface AddMessageOptions extends AddMessageDto {
  sender_email?: string;
  sender_name?: string;
  attachments?: Array<{ file_path: string; original_filename?: string; file_size?: number; mime_type?: string }>;
}

@injectable()
export class AddMessageUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(dto: AddMessageOptions, userId?: string): Promise<void> {
    const detail = await this.ticketRepo.findByNumber(dto.ticket_number);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    const allowed = await this.checkAccess(detail.ticket, userId, dto.sender_email);
    if (!allowed) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    await this.ticketRepo.addMessage(detail.ticket.id, {
      ticket_id: detail.ticket.id,
      sender_type: 'customer',
      sender_id: userId ?? null,
      sender_email: dto.sender_email ?? null,
      sender_name: dto.sender_name ?? null,
      message: dto.message,
      is_internal: false,
    });

    logger.info('Message added to ticket', {
      userId,
      ticketNumber: dto.ticket_number,
    });
  }

  private async checkAccess(
    ticket: { user_id?: string; guest_email?: string; order_id?: string | null },
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

    if (email && ticket.guest_email) {
      if (ticket.guest_email.trim().toLowerCase() === email.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  }
}
