export interface IWebhookVerifier {
  verifyStripeSignature(payload: string, signature: string): Promise<Record<string, unknown>>;
  verifyPayPalSignature(payload: string, headers: Record<string, string>): Promise<Record<string, unknown>>;
}
