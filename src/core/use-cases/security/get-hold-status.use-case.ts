import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { SecurityHoldStatus } from './security.types.js';
import { NotFoundError } from '../../errors/domain-errors.js';

@injectable()
export class GetHoldStatusUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
  ) {}

  async execute(holdId: string): Promise<SecurityHoldStatus> {
    const status = await this.holdRepo.getStatus(holdId);
    if (!status) {
      throw new NotFoundError('Security hold not found');
    }
    return status;
  }
}
