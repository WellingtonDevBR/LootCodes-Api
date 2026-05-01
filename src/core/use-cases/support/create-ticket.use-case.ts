import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { CreateTicketDto, SupportTicket } from './support.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('create-ticket');

@injectable()
export class CreateTicketUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(dto: CreateTicketDto, userId?: string): Promise<SupportTicket> {
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
}
