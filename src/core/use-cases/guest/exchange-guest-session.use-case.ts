import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository, GuestSession } from '../../ports/guest-session.port.js';
import { AuthenticationError } from '../../errors/domain-errors.js';

interface ExchangeGuestSessionDto {
  token: string;
  order_id?: string;
  email?: string;
}

interface ExchangeGuestSessionResult {
  email: string;
  order_id: string;
  expires_at: string;
}

@injectable()
export class ExchangeGuestSessionUseCase {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
  ) {}

  async execute(dto: ExchangeGuestSessionDto): Promise<ExchangeGuestSessionResult> {
    const session: GuestSession | null = await this.guestSessionRepo.exchangeToken(dto.token);

    if (!session) {
      throw new AuthenticationError('Invalid or expired guest token');
    }

    if (dto.order_id && session.order_id !== dto.order_id) {
      throw new AuthenticationError('Token does not match the provided order');
    }

    return {
      email: session.email,
      order_id: session.order_id,
      expires_at: session.expires_at,
    };
  }
}
