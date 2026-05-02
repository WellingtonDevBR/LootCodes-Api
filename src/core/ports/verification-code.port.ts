export type VerificationAction = 'sign_in' | 'sign_up';

export interface GenerateCodeResult {
  code: string;
  expiresAt: Date;
}

export interface IVerificationCodeService {
  generate(
    email: string,
    action: VerificationAction,
    ipAddress: string,
    requestId: string,
    expiresInMinutes?: number,
  ): Promise<GenerateCodeResult>;

  verify(
    email: string,
    action: VerificationAction,
    code: string,
    ipAddress: string,
    requestId: string,
  ): Promise<boolean>;
}
