export interface NewsletterSubscribeDto {
  email: string;
  consent: boolean;
  language_code?: string;
  recaptcha_token: string;
}

export interface NewsletterResult {
  success: boolean;
  message?: string;
  error?: string;
}
