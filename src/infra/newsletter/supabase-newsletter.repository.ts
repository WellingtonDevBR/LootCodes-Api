import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { INewsletterRepository } from '../../core/ports/newsletter-repository.port.js';
import type { NewsletterSubscribeDto, NewsletterResult } from '../../core/services/newsletter/newsletter.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-newsletter-repository');

@injectable()
export class SupabaseNewsletterRepository implements INewsletterRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async subscribe(params: NewsletterSubscribeDto): Promise<NewsletterResult> {
    const result = await this.db.rpc<NewsletterResult>('newsletter_subscribe', {
      p_email: params.email,
      p_consent: params.consent,
      p_language_code: params.language_code ?? null,
    });
    logger.debug('Newsletter subscribe RPC completed', { email: params.email });
    return result;
  }

  async confirm(token: string): Promise<NewsletterResult> {
    const result = await this.db.rpc<NewsletterResult>('newsletter_confirm', {
      p_token: token,
    });
    logger.debug('Newsletter confirm RPC completed');
    return result;
  }

  async unsubscribe(token: string): Promise<NewsletterResult> {
    const result = await this.db.rpc<NewsletterResult>('newsletter_unsubscribe', {
      p_token: token,
    });
    logger.debug('Newsletter unsubscribe RPC completed');
    return result;
  }
}
