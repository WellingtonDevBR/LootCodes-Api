import { injectable, inject } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../../di/tokens.js';
import type { IGuestSessionRepository } from '../../ports/guest-session.port.js';
import type { RevealKeyUseCase } from '../key-delivery/reveal-key.use-case.js';
import { AuthenticationError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('reveal-guest-key-use-case');

@injectable()
export class RevealGuestKeyUseCase {
  constructor(
    @inject(TOKENS.GuestSessionRepository) private guestSessionRepo: IGuestSessionRepository,
    @inject(UC_TOKENS.RevealKey) private revealKey: RevealKeyUseCase,
  ) {}

  async execute(
    token: string,
    orderId: string,
    keyId: string,
    clientIP: string,
    userAgent: string,
  ): Promise<string> {
    const session = await this.guestSessionRepo.validateToken(token);
    if (!session) {
      throw new AuthenticationError('Invalid or expired guest session');
    }
    if (session.order_id !== orderId) {
      logger.warn('Guest order ID mismatch', { expected: session.order_id, received: orderId });
      throw new ForbiddenError('You do not have access to this order');
    }

    logger.info('Guest revealing key', { orderId, keyId, email: session.email });
    return this.revealKey.execute(keyId, orderId, session.email, clientIP, userAgent);
  }
}
