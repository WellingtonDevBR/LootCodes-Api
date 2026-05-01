import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { AddMessageDto } from './support.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('add-message');

@injectable()
export class AddMessageUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(dto: AddMessageDto, userId: string): Promise<void> {
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
}
