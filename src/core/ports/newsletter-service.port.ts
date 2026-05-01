import type { NewsletterSubscribeDto, NewsletterResult } from '../services/newsletter/newsletter.types.js';

export interface INewsletterService {
  subscribe(params: NewsletterSubscribeDto, clientIP: string): Promise<NewsletterResult>;
  confirm(token: string): Promise<NewsletterResult>;
  unsubscribe(token: string): Promise<NewsletterResult>;
}
