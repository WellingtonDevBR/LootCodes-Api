import type { SupportTicket, TicketDetail, CreateTicketDto, AddMessageDto, TicketFeedbackDto } from '../services/support/support.types.js';

export interface ISupportService {
  createTicket(dto: CreateTicketDto, userId?: string): Promise<SupportTicket>;
  getTicket(ticketNumber: string, userId?: string): Promise<TicketDetail>;
  getUserTickets(userId: string): Promise<SupportTicket[]>;
  addMessage(dto: AddMessageDto, userId: string): Promise<void>;
  updateStatus(ticketNumber: string, status: string, userId: string, reason?: string): Promise<void>;
  reopenTicket(ticketNumber: string, userId: string, reason?: string): Promise<void>;
  submitFeedback(dto: TicketFeedbackDto, userId?: string): Promise<void>;
  getVerificationTicketsForOrder(orderId: string, userId: string): Promise<SupportTicket[]>;
}
