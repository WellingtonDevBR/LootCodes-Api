import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-status');

@injectable()
export class UpdateStatusUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(
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
}
