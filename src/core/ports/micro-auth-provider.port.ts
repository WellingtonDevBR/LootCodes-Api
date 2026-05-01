export interface MicroAuthResult {
  authorization_id: string;
  amount_cents: number;
  currency: string;
}

export interface IMicroAuthProvider {
  createMicroAuth(paymentMethodId: string, customerId?: string): Promise<MicroAuthResult>;
  verifyAmount(authorizationId: string, submittedAmount: number): Promise<boolean>;
  cancelAuth(authorizationId: string): Promise<void>;
}
