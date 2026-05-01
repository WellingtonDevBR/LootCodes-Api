import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { SupportTicket } from './support.types.js';

@injectable()
export class GetVerificationTicketsUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<SupportTicket[]> {
    const tickets = await this.ticketRepo.getVerificationTicketsForOrder(orderId);
    return tickets.filter((t) => t.user_id === userId);
  }
}
