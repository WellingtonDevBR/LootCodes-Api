import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { SupportTicket, SupportTicketWithMessages } from './support.types.js';

@injectable()
export class GetUserTicketsUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
  ) {}

  async execute(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepo.findByUserId(userId);
  }

  async executeWithMessages(userId: string): Promise<SupportTicketWithMessages[]> {
    return this.ticketRepo.findByUserIdWithMessages(userId);
  }
}
