import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { TicketDetail } from './support.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';

@injectable()
export class GetTicketUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(ticketNumber: string, userId?: string): Promise<TicketDetail> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (userId && detail.ticket.user_id && detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    return detail;
  }
}
