import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { TicketFeedbackDto } from './support.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('submit-feedback');

@injectable()
export class SubmitFeedbackUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(dto: TicketFeedbackDto, userId?: string): Promise<void> {
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
}
