import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INewsletterRepository } from '../../ports/newsletter-repository.port.js';
import type { IRecaptchaVerifier } from '../../ports/recaptcha.port.js';
import { isAssessmentAcceptable } from '../../ports/recaptcha.port.js';
import type { INewsletterService } from '../../ports/newsletter-service.port.js';
import type { NewsletterSubscribeDto, NewsletterResult } from './newsletter.types.js';
import { ValidationError, SecurityVerificationError } from '../../errors/domain-errors.js';
import { isValidEmail } from '../../../shared/input-validation.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('newsletter-service');

@injectable()
export class NewsletterService implements INewsletterService {
  constructor(
    @inject(TOKENS.NewsletterRepository) private newsletterRepo: INewsletterRepository,
    @inject(TOKENS.RecaptchaVerifier) private recaptcha: IRecaptchaVerifier,
  ) {}

  async subscribe(params: NewsletterSubscribeDto, clientIP: string): Promise<NewsletterResult> {
    if (!isValidEmail(params.email)) {
      throw new ValidationError('Invalid email address');
    }

    const assessment = await this.recaptcha.assess({
      token: params.recaptcha_token,
      expectedAction: 'newsletter_subscribe',
      userIpAddress: clientIP,
    });

    if (!assessment.valid || !isAssessmentAcceptable(assessment, 0.5)) {
      logger.warn('reCAPTCHA verification failed for newsletter subscribe', {
        score: assessment.score,
        reasons: assessment.reasons.join(','),
      });
      throw new SecurityVerificationError('Security verification failed');
    }

    logger.info('Newsletter subscribe request', { email: params.email });
    return this.newsletterRepo.subscribe(params);
  }

  async confirm(token: string): Promise<NewsletterResult> {
    if (!token) {
      throw new ValidationError('Confirmation token is required');
    }

    logger.info('Newsletter confirm request');
    return this.newsletterRepo.confirm(token);
  }

  async unsubscribe(token: string): Promise<NewsletterResult> {
    if (!token) {
      throw new ValidationError('Unsubscribe token is required');
    }

    logger.info('Newsletter unsubscribe request');
    return this.newsletterRepo.unsubscribe(token);
  }
}
