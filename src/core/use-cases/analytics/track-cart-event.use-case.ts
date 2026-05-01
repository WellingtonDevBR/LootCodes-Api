import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAnalyticsRepository } from '../../ports/analytics-repository.port.js';
import type { CartEvent } from './analytics.types.js';
import { ValidationError } from '../../errors/domain-errors.js';

const VALID_CART_ACTIONS = ['add', 'remove', 'checkout_started', 'checkout_completed', 'checkout_abandoned'] as const;

@injectable()
export class TrackCartEventUseCase {
  constructor(
    @inject(TOKENS.AnalyticsRepository) private analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(event: CartEvent): Promise<void> {
    if (!VALID_CART_ACTIONS.includes(event.action)) {
      throw new ValidationError(`Invalid cart action: ${event.action}`);
    }
    await this.analyticsRepo.insertCartEvent(event);
  }
}
