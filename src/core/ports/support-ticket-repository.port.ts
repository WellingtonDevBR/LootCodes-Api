import type { SupportTicket, TicketMessage, CreateTicketDto, TicketDetail, TicketFeedbackDto } from '../services/support/support.types.js';

export interface ISupportTicketRepository {
  create(params: CreateTicketDto & { user_id?: string }): Promise<SupportTicket>;
  findByNumber(ticketNumber: string): Promise<TicketDetail | null>;
  findByUserId(userId: string): Promise<SupportTicket[]>;
  addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'created_at'>): Promise<TicketMessage>;
  updateStatus(ticketId: string, status: string, reason?: string): Promise<void>;
  submitFeedback(ticketId: string, feedback: TicketFeedbackDto): Promise<void>;
  getVerificationTicketsForOrder(orderId: string): Promise<SupportTicket[]>;
}
