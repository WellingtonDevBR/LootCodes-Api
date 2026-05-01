import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IPricingRepository } from '../../../ports/pricing-repository.port.js';
import { createLogger } from '../../../../shared/logger.js';

const logger = createLogger('sync-currency-rates');

@injectable()
export class SyncCurrencyRatesUseCase {
  constructor(
    @inject(TOKENS.PricingRepository) private pricingRepo: IPricingRepository,
  ) {}

  async execute(): Promise<{ rates?: Record<string, number>; currencies?: string[] } | null> {
    logger.info('Syncing currency rates');
    return this.pricingRepo.syncRates();
  }
}
