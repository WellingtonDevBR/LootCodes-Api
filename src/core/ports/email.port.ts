export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface IEmailSender {
  send(message: EmailMessage): Promise<{ id: string }>;
}
