import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPriceMatchRepository } from '../../ports/price-match-repository.port.js';
import type { PriceMatchClaim } from './price-match.types.js';

@injectable()
export class GetUserClaimsUseCase {
  constructor(
    @inject(TOKENS.PriceMatchRepository) private priceMatchRepo: IPriceMatchRepository,
  ) {}

  async execute(userId: string): Promise<PriceMatchClaim[]> {
    return this.priceMatchRepo.getUserClaims(userId);
  }
}
