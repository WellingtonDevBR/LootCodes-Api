import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { SessionOutcomeDto } from './analytics.types.js';

@injectable()
export class UpdateSessionOutcomeUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(dto: SessionOutcomeDto): Promise<void> {
    await this.analyticsRepo.updateSessionOutcome(dto);
  }
}
