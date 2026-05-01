import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INewsletterRepository } from '../../ports/newsletter-repository.port.js';
import type { NewsletterResult } from './newsletter.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('unsubscribe-use-case');

@injectable()
export class UnsubscribeUseCase {
  constructor(
    @inject(TOKENS.NewsletterRepository) private newsletterRepo: INewsletterRepository,
  ) {}

  async execute(token: string): Promise<NewsletterResult> {
    if (!token) {
      throw new ValidationError('Unsubscribe token is required');
    }

    logger.info('Newsletter unsubscribe request');
    return this.newsletterRepo.unsubscribe(token);
  }
}
