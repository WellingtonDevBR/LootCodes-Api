import type { NewsletterSubscribeDto, NewsletterResult } from '../use-cases/newsletter/newsletter.types.js';

export interface INewsletterRepository {
  subscribe(params: NewsletterSubscribeDto): Promise<NewsletterResult>;
  confirm(token: string): Promise<NewsletterResult>;
  unsubscribe(token: string): Promise<NewsletterResult>;
}
