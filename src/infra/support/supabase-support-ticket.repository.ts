import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ISupportTicketRepository } from '../../core/ports/support-ticket-repository.port.js';
import type {
  SupportTicket,
  TicketMessage,
  CreateTicketDto,
  TicketDetail,
  TicketFeedbackDto,
} from '../../core/services/support/support.types.js';

@injectable()
export class SupabaseSupportTicketRepository implements ISupportTicketRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async create(params: CreateTicketDto & { user_id?: string }): Promise<SupportTicket> {
    return this.db.insert<SupportTicket>('support_tickets', {
      subject: params.subject,
      user_id: params.user_id ?? null,
      guest_email: params.guest_email ?? null,
      order_id: params.order_id ?? null,
      category: params.category ?? null,
      status: 'open',
      priority: 'normal',
    });
  }

  async findByNumber(ticketNumber: string): Promise<TicketDetail | null> {
    const ticket = await this.db.queryOne<SupportTicket>('support_tickets', {
      eq: [['ticket_number', ticketNumber]],
    });

    if (!ticket) return null;

    const messages = await this.db.query<TicketMessage>('ticket_messages', {
      eq: [['ticket_id', ticket.id]],
      order: { column: 'created_at', ascending: true },
    });

    return { ticket, messages };
  }

  async findByUserId(userId: string): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>('support_tickets', {
      eq: [['user_id', userId]],
      order: { column: 'updated_at', ascending: false },
    });
  }

  async addMessage(
    ticketId: string,
    message: Omit<TicketMessage, 'id' | 'created_at'>,
  ): Promise<TicketMessage> {
    return this.db.insert<TicketMessage>('ticket_messages', {
      ticket_id: ticketId,
      sender_type: message.sender_type,
      message: message.message,
      attachments: message.attachments ?? null,
    });
  }

  async updateStatus(ticketId: string, status: string, _reason?: string): Promise<void> {
    await this.db.update('support_tickets', { id: ticketId }, { status });
  }

  async submitFeedback(ticketId: string, feedback: TicketFeedbackDto): Promise<void> {
    await this.db.update('support_tickets', { id: ticketId }, {
      feedback_rating: feedback.rating,
      feedback_comment: feedback.comment ?? null,
    });
  }

  async getVerificationTicketsForOrder(orderId: string): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>('support_tickets', {
      eq: [['order_id', orderId], ['category', 'verification']],
      order: { column: 'created_at', ascending: false },
    });
  }
}
