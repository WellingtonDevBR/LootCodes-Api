import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { IAttachmentStorage } from '../../ports/attachment-storage.port.js';
import type { ISupportService } from '../../ports/support-service.port.js';
import type {
  SupportTicket,
  TicketDetail,
  CreateTicketDto,
  AddMessageDto,
  TicketFeedbackDto,
} from './support.types.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('support-service');

@injectable()
export class SupportService implements ISupportService {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.AttachmentStorage) private _attachmentStorage: IAttachmentStorage,
  ) {}

  async createTicket(dto: CreateTicketDto, userId?: string): Promise<SupportTicket> {
    if (!dto.subject || !dto.message) {
      throw new ValidationError('Subject and message are required');
    }

    const ticket = await this.ticketRepo.create({
      ...dto,
      user_id: userId,
    });

    logger.info('Support ticket created', {
      userId,
      ticketNumber: ticket.ticket_number,
    });

    return ticket;
  }

  async getTicket(ticketNumber: string, userId?: string): Promise<TicketDetail> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (userId && detail.ticket.user_id && detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    return detail;
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepo.findByUserId(userId);
  }

  async addMessage(dto: AddMessageDto, userId: string): Promise<void> {
    const detail = await this.ticketRepo.findByNumber(dto.ticket_number);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    await this.ticketRepo.addMessage(detail.ticket.id, {
      ticket_id: detail.ticket.id,
      sender_type: 'customer',
      message: dto.message,
    });

    logger.info('Message added to ticket', {
      userId,
      ticketNumber: dto.ticket_number,
    });
  }

  async updateStatus(
    ticketNumber: string,
    status: string,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    await this.ticketRepo.updateStatus(detail.ticket.id, status, reason);
    logger.info('Ticket status updated', { ticketNumber, status, userId });
  }

  async reopenTicket(ticketNumber: string, userId: string, reason?: string): Promise<void> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    await this.ticketRepo.updateStatus(detail.ticket.id, 'open', reason);
    logger.info('Ticket reopened', { ticketNumber, userId });
  }

  async submitFeedback(dto: TicketFeedbackDto, userId?: string): Promise<void> {
    const detail = await this.ticketRepo.findByNumber(dto.ticket_number);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (userId && detail.ticket.user_id && detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    await this.ticketRepo.submitFeedback(detail.ticket.id, dto);
    logger.info('Feedback submitted', { ticketNumber: dto.ticket_number, rating: dto.rating });
  }

  async getVerificationTicketsForOrder(orderId: string, userId: string): Promise<SupportTicket[]> {
    const tickets = await this.ticketRepo.getVerificationTicketsForOrder(orderId);
    return tickets.filter((t) => t.user_id === userId);
  }
}
