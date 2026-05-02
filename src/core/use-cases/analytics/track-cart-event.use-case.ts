import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { CartEvent } from './analytics.types.js';

@injectable()
export class TrackCartEventUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(event: CartEvent): Promise<void> {
    if (!event.event_type || typeof event.event_type !== 'string') return;
    await this.analyticsRepo.insertCartEvent(event);
  }
}
