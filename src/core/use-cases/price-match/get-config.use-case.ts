import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPriceMatchRepository } from '../../ports/price-match-repository.port.js';
import type { PriceMatchConfig } from './price-match.types.js';

@injectable()
export class GetConfigUseCase {
  constructor(
    @inject(TOKENS.PriceMatchRepository) private priceMatchRepo: IPriceMatchRepository,
  ) {}

  async execute(): Promise<PriceMatchConfig | null> {
    return this.priceMatchRepo.getConfig();
  }
}
