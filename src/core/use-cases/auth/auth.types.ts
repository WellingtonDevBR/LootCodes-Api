export type AuthAction = 'sign_in' | 'sign_up' | 'password_reset' | 'send-otp' | 'verify-otp';

export interface AuthRequestDto {
  email?: string;
  password?: string;
  phone?: string;
  action: AuthAction;
  recaptcha_token?: string;
  platform?: 'web' | 'mobile_ios' | 'mobile_android' | 'mobile';
  full_name?: string;
  country?: string;
  fingerprint_hash?: string;
  referral_code?: string;
  otp_code?: string;
  email_verification_code?: string;
}

export interface AuthContext {
  requestId: string;
  ipAddress: string;
  userAgent: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  message?: string;
  role?: string;
  requiresVerification?: boolean;
  emailVerificationRequired?: boolean;
}
