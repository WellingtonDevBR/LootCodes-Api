import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { IVerificationStorage } from '../../ports/verification-storage.port.js';
import { NotFoundError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('upload-document-use-case');

@injectable()
export class UploadDocumentUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
    @inject(TOKENS.VerificationStorage) private storage: IVerificationStorage,
  ) {}

  async execute(
    holdId: string,
    path: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const hold = await this.holdRepo.findById(holdId);
    if (!hold) {
      throw new NotFoundError('Security hold not found');
    }

    const url = await this.storage.upload(path, fileBuffer, contentType);
    logger.info('Verification document uploaded', { holdId, path });
    return url;
  }
}
