import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import type { SecurityHold } from './security.types.js';
import { NotFoundError } from '../../errors/domain-errors.js';

@injectable()
export class GetHoldUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private holdRepo: ISecurityHoldRepository,
  ) {}

  async execute(holdId: string): Promise<SecurityHold> {
    const hold = await this.holdRepo.findById(holdId);
    if (!hold) {
      throw new NotFoundError('Security hold not found');
    }
    return hold;
  }
}
