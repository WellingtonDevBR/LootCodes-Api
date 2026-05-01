import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { SubmitHoldResponseDto } from './security.types.js';
import { NotFoundError, RateLimitError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('submit-response-use-case');

@injectable()
export class SubmitResponseUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
  ) {}

  async execute(holdId: string, dto: SubmitHoldResponseDto, email: string): Promise<void> {
    const allowed = await this.holdRepo.checkRateLimit(email, 'email', 'hold_response');
    await this.holdRepo.recordAttempt(email, 'email', 'hold_response');

    if (!allowed) {
      throw new RateLimitError('Too many response attempts');
    }

    const hold = await this.holdRepo.findById(holdId);
    if (!hold) {
      throw new NotFoundError('Security hold not found');
    }

    await this.holdRepo.submitResponse(holdId, dto);
    logger.info('Security hold response submitted', { holdId, email });
  }
}
