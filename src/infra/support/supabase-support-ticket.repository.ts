import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAttachmentStorage } from '../../core/ports/attachment-storage.port.js';
import type { ISupportTicketRepository } from '../../core/ports/support-ticket-repository.port.js';
import type {
  SupportTicket,
  SupportTicketWithMessages,
  TicketMessage,
  TicketAttachment,
  SupportTicketOrder,
  CreateTicketDto,
  TicketDetail,
  TicketFeedbackDto,
} from '../../core/use-cases/support/support.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('support-ticket-repo');

const TICKET_LIST_SELECT = [
  'id', 'ticket_number', 'user_id', 'guest_email', 'subject', 'description',
  'ticket_type', 'status', 'priority', 'order_id', 'order_item_id',
  'product_key_id', 'created_at', 'updated_at', 'resolved_at',
].join(', ');

const TICKET_WITH_MESSAGES_SELECT = `${TICKET_LIST_SELECT}, ticket_messages(created_at)`;

const TICKET_DETAIL_SELECT = [
  '*',
  'order:orders!order_id(order_number, status, fulfillment_status, refund_status, refunded_at, refund_amount, refund_reason, total_amount, currency, order_channel, contact_email, delivery_email, guest_email)',
].join(', ');

const VERIFICATION_BUCKET = 'verification-documents';

interface RawTicketRow extends Record<string, unknown> {
  id: string;
  ticket_number: string;
  order: SupportTicketOrder | null;
}

interface RawAttachment {
  id: string;
  ticket_id: string;
  message_id?: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string | null;
  created_at: string;
}

@injectable()
export class SupabaseSupportTicketRepository implements ISupportTicketRepository {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.AttachmentStorage) private attachmentStorage: IAttachmentStorage,
  ) {}

  async create(params: CreateTicketDto & { user_id?: string }): Promise<SupportTicket> {
    return this.db.insert<SupportTicket>('support_tickets', {
      subject: params.subject,
      description: params.description ?? params.message ?? null,
      user_id: params.user_id ?? null,
      guest_email: params.guest_email ?? null,
      order_id: params.order_id ?? null,
      category: params.category ?? null,
      ticket_type: params.ticket_type ?? null,
      source: params.source ?? 'web_form',
      source_channel: params.source_channel ?? 'web',
      metadata: params.metadata ?? null,
      status: 'open',
      priority: 'normal',
    });
  }

  async findByNumber(ticketNumber: string): Promise<TicketDetail | null> {
    const raw = await this.db.queryOne<RawTicketRow>('support_tickets', {
      select: TICKET_DETAIL_SELECT,
      eq: [['ticket_number', ticketNumber]],
    });

    if (!raw) return null;

    const order = (raw.order as SupportTicketOrder | null) ?? null;
    const { order: _omit, ...ticketFields } = raw;
    const ticket = ticketFields as unknown as SupportTicket;

    const messages = await this.db.query<TicketMessage>('ticket_messages', {
      select: '*',
      eq: [['ticket_id', ticket.id]],
      order: { column: 'created_at', ascending: true },
    });

    const rawAttachments = await this.db.query<RawAttachment>('ticket_attachments', {
      select: '*',
      eq: [['ticket_id', ticket.id]],
      order: { column: 'created_at', ascending: true },
    });

    const attachments = await this.resolveAttachmentUrls(rawAttachments, ticket);

    const ticketLevelAttachments = attachments.filter(a => !a.message_id);
    const attachmentsByMessage = new Map<string, TicketAttachment[]>();
    for (const a of attachments) {
      if (a.message_id) {
        const list = attachmentsByMessage.get(a.message_id) ?? [];
        list.push(a);
        attachmentsByMessage.set(a.message_id, list);
      }
    }

    const messagesWithAttachments = messages.map(m => ({
      ...m,
      attachments: attachmentsByMessage.get(m.id) ?? [],
    }));

    return {
      ticket,
      messages: messagesWithAttachments,
      order,
      attachments: ticketLevelAttachments,
    };
  }

  async findByUserId(userId: string): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>('support_tickets', {
      select: TICKET_LIST_SELECT,
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
    });
  }

  async findByUserIdWithMessages(userId: string): Promise<SupportTicketWithMessages[]> {
    return this.db.query<SupportTicketWithMessages>('support_tickets', {
      select: TICKET_WITH_MESSAGES_SELECT,
      eq: [['user_id', userId]],
      order: { column: 'created_at', ascending: false },
      limit: 10,
    });
  }

  async addMessage(
    ticketId: string,
    message: Omit<TicketMessage, 'id' | 'created_at'>,
  ): Promise<TicketMessage> {
    return this.db.insert<TicketMessage>('ticket_messages', {
      ticket_id: ticketId,
      sender_type: message.sender_type,
      sender_id: message.sender_id ?? null,
      sender_email: message.sender_email ?? null,
      sender_name: message.sender_name ?? null,
      message: message.message,
      is_internal: message.is_internal ?? false,
      attachments: message.attachments ?? null,
    });
  }

  async updateStatus(ticketId: string, status: string, _reason?: string): Promise<void> {
    await this.db.update('support_tickets', { id: ticketId }, { status });
  }

  async submitFeedback(ticketId: string, feedback: TicketFeedbackDto): Promise<void> {
    await this.db.update('support_tickets', { id: ticketId }, {
      customer_feedback_rating: feedback.rating,
      customer_feedback_at: new Date().toISOString(),
    });
  }

  async getVerificationTicketsForOrder(orderId: string): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>('support_tickets', {
      eq: [['order_id', orderId], ['category', 'verification']],
      order: { column: 'created_at', ascending: false },
    });
  }

  async findVerificationTicketForOrder(
    orderId: string,
    ticketTypes: string[],
  ): Promise<SupportTicket | null> {
    return this.db.queryOne<SupportTicket>('support_tickets', {
      select: 'id, ticket_number, status, ticket_type',
      eq: [['order_id', orderId]],
      in: [['ticket_type', ticketTypes]],
      order: { column: 'created_at', ascending: false },
    });
  }

  async autoLinkUser(ticketId: string, userId: string): Promise<void> {
    try {
      await this.db.update('support_tickets', { id: ticketId }, { user_id: userId });
    } catch (error) {
      logger.error('Failed to auto-link ticket to user', error, { ticketId, userId });
    }
  }

  private async resolveAttachmentUrls(
    rawAttachments: RawAttachment[],
    ticket: SupportTicket,
  ): Promise<TicketAttachment[]> {
    const ticketNum = ticket.ticket_number;
    const ticketOrderId = ticket.order_id ?? '';

    return Promise.all(
      rawAttachments.map(async (attachment): Promise<TicketAttachment> => {
        try {
          const fp = attachment.file_path;
          const isVerificationDoc = !fp.startsWith('TICKET-') && !fp.startsWith('ticket-attachments/');

          if (!isVerificationDoc) {
            const isOwned = fp.startsWith(`${ticketNum}/`) || fp.startsWith(`ticket-attachments/${ticketNum}/`);
            if (!isOwned) {
              return { ...attachment, file_url: '' };
            }
          } else {
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]{2,5}$/i;
            if (!uuidPattern.test(fp) || fp.split('/')[0] !== ticketOrderId) {
              return { ...attachment, file_url: '' };
            }
          }

          const bucket = isVerificationDoc ? VERIFICATION_BUCKET : 'support-attachments';
          const url = await this.attachmentStorage.getSignedUrl(fp, bucket);
          return { ...attachment, file_url: url };
        } catch {
          return { ...attachment, file_url: '' };
        }
      }),
    );
  }
}
