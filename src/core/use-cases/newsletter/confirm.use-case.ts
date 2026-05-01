import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INewsletterRepository } from '../../ports/newsletter-repository.port.js';
import type { NewsletterResult } from './newsletter.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('confirm-use-case');

@injectable()
export class ConfirmUseCase {
  constructor(
    @inject(TOKENS.NewsletterRepository) private newsletterRepo: INewsletterRepository,
  ) {}

  async execute(token: string): Promise<NewsletterResult> {
    if (!token) {
      throw new ValidationError('Confirmation token is required');
    }

    logger.info('Newsletter confirm request');
    return this.newsletterRepo.confirm(token);
  }
}
