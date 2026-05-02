import { injectable } from 'tsyringe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IAuthProvider, AuthUser, SignInResult, SignUpResult } from '../../core/ports/auth.port.js';
import { AuthenticationError, InternalError } from '../../core/errors/domain-errors.js';
import { getEnv } from '../../config/env.js';

function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: raw.id as string,
    email: raw.email as string | undefined,
    phone: raw.phone as string | undefined,
    role: raw.role as string | undefined,
    user_metadata: raw.user_metadata as Record<string, unknown> | undefined,
    app_metadata: raw.app_metadata as Record<string, unknown> | undefined,
    created_at: raw.created_at as string | undefined,
    confirmed_at: raw.confirmed_at as string | undefined,
    email_confirmed_at: raw.email_confirmed_at as string | undefined,
    phone_confirmed_at: raw.phone_confirmed_at as string | undefined,
  };
}

@injectable()
export class SupabaseAuthAdapter implements IAuthProvider {
  private serviceClient: SupabaseClient | null = null;

  private getServiceClient(): SupabaseClient {
    if (this.serviceClient) return this.serviceClient;
    const env = getEnv();
    this.serviceClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    return this.serviceClient;
  }

  private getAnonClient(token?: string): SupabaseClient {
    const env = getEnv();
    const options = token
      ? { global: { headers: { authorization: `Bearer ${token}` } } }
      : {};
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
  }

  async signInWithPassword(email: string, password: string): Promise<SignInResult> {
    const client = this.getAnonClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new AuthenticationError(error.message);
    return {
      user: mapUser(data.user as unknown as Record<string, unknown>),
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user: mapUser(data.session.user as unknown as Record<string, unknown>),
          }
        : null,
    };
  }

  async signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<SignUpResult> {
    const client = this.getServiceClient();
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw new InternalError(error.message);

    const signInResult = await this.signInWithPassword(email, password);

    return {
      user: mapUser(data.user as unknown as Record<string, unknown>),
      session: signInResult.session,
    };
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const client = this.getServiceClient();
    const { data, error } = await client.auth.admin.getUserById(userId);
    if (error) return null;
    return mapUser(data.user as unknown as Record<string, unknown>);
  }

  async getUserByToken(token: string): Promise<AuthUser | null> {
    const client = this.getAnonClient();
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return mapUser(data.user as unknown as Record<string, unknown>);
  }

  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<void> {
    const client = this.getServiceClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw new InternalError(error.message);
  }

  async updateUser(userId: string, attributes: Record<string, unknown>): Promise<AuthUser> {
    const client = this.getServiceClient();
    const { data, error } = await client.auth.admin.updateUserById(userId, attributes);
    if (error) throw new InternalError(error.message);
    return mapUser(data.user as unknown as Record<string, unknown>);
  }

  async sendOtp(phone: string): Promise<void> {
    const client = this.getAnonClient();
    const { error } = await client.auth.signInWithOtp({ phone });
    if (error) throw new InternalError(error.message);
  }

  async verifyOtp(phone: string, token: string): Promise<SignInResult> {
    const client = this.getAnonClient();
    const { data, error } = await client.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw new AuthenticationError(error.message);
    return {
      user: mapUser(data.user as unknown as Record<string, unknown>),
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user: mapUser(data.session.user as unknown as Record<string, unknown>),
          }
        : null,
    };
  }
}
