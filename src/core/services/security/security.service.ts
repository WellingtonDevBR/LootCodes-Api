import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { IVerificationStorage } from '../../ports/verification-storage.port.js';
import type { ISecurityService } from '../../ports/security-service.port.js';
import type { SecurityHold, SecurityHoldStatus, SubmitHoldResponseDto } from './security.types.js';
import { NotFoundError, RateLimitError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('security-service');

@injectable()
export class SecurityService implements ISecurityService {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
    @inject(TOKENS.VerificationStorage) private storage: IVerificationStorage,
  ) {}

  async getHold(holdId: string): Promise<SecurityHold> {
    const hold = await this.holdRepo.findById(holdId);
    if (!hold) {
      throw new NotFoundError('Security hold not found');
    }
    return hold;
  }

  async getHoldStatus(holdId: string): Promise<SecurityHoldStatus> {
    const status = await this.holdRepo.getStatus(holdId);
    if (!status) {
      throw new NotFoundError('Security hold not found');
    }
    return status;
  }

  async uploadDocument(
    holdId: string,
    path: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.getHold(holdId);

    const url = await this.storage.upload(path, fileBuffer, contentType);
    logger.info('Verification document uploaded', { holdId, path });
    return url;
  }

  async submitResponse(
    holdId: string,
    dto: SubmitHoldResponseDto,
    email: string,
  ): Promise<void> {
    const allowed = await this.holdRepo.checkRateLimit(email, 'email', 'hold_response');
    await this.holdRepo.recordAttempt(email, 'email', 'hold_response');

    if (!allowed) {
      throw new RateLimitError('Too many response attempts');
    }

    await this.getHold(holdId);
    await this.holdRepo.submitResponse(holdId, dto);
    logger.info('Security hold response submitted', { holdId, email });
  }
}
