import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository } from '../../ports/guest-session.port.js';
import type { CreateTicketUseCase } from '../support/create-ticket.use-case.js';
import type { SupportTicket, CreateTicketDto } from '../support/support.types.js';
import { AuthenticationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('create-guest-support-ticket-use-case');

@injectable()
export class CreateGuestSupportTicketUseCase {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
    @inject(UC_TOKENS.CreateTicket) private createTicket: CreateTicketUseCase,
  ) {}

  async execute(token: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const session = await this.guestSessionRepo.validateToken(token);
    if (!session) {
      throw new AuthenticationError('Invalid or expired guest session');
    }

    const ticketDto: CreateTicketDto = {
      ...dto,
      guest_email: session.email,
      order_id: dto.order_id ?? session.order_id,
    };

    logger.info('Guest creating support ticket', { email: session.email, subject: dto.subject });
    return this.createTicket.execute(ticketDto);
  }
}
