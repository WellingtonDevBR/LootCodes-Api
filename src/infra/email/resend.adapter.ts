import { injectable } from 'tsyringe';
import { Resend } from 'resend';
import type { IEmailSender, EmailMessage } from '../../core/ports/email.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { getEnv } from '../../config/env.js';

@injectable()
export class ResendEmailAdapter implements IEmailSender {
  private client: Resend | null = null;

  private getClient(): Resend {
    if (this.client) return this.client;
    const env = getEnv();
    this.client = new Resend(env.RESEND_API_KEY);
    return this.client;
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    const env = getEnv();
    const { data, error } = await this.getClient().emails.send({
      from: message.from ?? `${env.SITE_NAME} <noreply@${new URL(env.SITE_URL).hostname}>`,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      replyTo: message.replyTo,
    });

    if (error) throw new InternalError(`Email send failed: ${error.message}`);
    return { id: data?.id ?? '' };
  }
}
