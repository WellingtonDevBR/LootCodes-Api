export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface SignInResult {
  user: AuthUser;
  session: AuthSession | null;
}

export interface SignUpResult {
  user: AuthUser;
  session: AuthSession | null;
}

export interface IAuthProvider {
  signInWithPassword(email: string, password: string): Promise<SignInResult>;
  signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<SignUpResult>;
  getUserById(userId: string): Promise<AuthUser | null>;
  getUserByToken(token: string): Promise<AuthUser | null>;
  resetPasswordForEmail(email: string, redirectTo?: string): Promise<void>;
  updateUser(userId: string, attributes: Record<string, unknown>): Promise<AuthUser>;
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, token: string): Promise<SignInResult>;
}
