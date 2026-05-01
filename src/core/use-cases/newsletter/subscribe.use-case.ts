import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { INewsletterRepository } from '../../ports/newsletter-repository.port.js';
import type { IRecaptchaVerifier } from '../../ports/recaptcha.port.js';
import { isAssessmentAcceptable } from '../../ports/recaptcha.port.js';
import type { NewsletterSubscribeDto, NewsletterResult } from './newsletter.types.js';
import { ValidationError, SecurityVerificationError } from '../../errors/domain-errors.js';
import { isValidEmail } from '../../../shared/input-validation.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('subscribe-use-case');

@injectable()
export class SubscribeUseCase {
  constructor(
    @inject(TOKENS.NewsletterRepository) private newsletterRepo: INewsletterRepository,
    @inject(TOKENS.RecaptchaVerifier) private recaptcha: IRecaptchaVerifier,
  ) {}

  async execute(params: NewsletterSubscribeDto, clientIP: string): Promise<NewsletterResult> {
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
}
