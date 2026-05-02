import { injectable, inject } from 'tsyringe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import type {
  IVerificationCodeService,
  VerificationAction,
  GenerateCodeResult,
} from '../../core/ports/verification-code.port.js';
import { TOKENS } from '../../di/tokens.js';
import { ValidationError, RateLimitError } from '../../core/errors/domain-errors.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('verification-code-adapter');

const MAX_CODES_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 3;
const DEFAULT_EXPIRY_MINUTES = 15;

@injectable()
export class SupabaseVerificationCodeAdapter implements IVerificationCodeService {
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (this.client) return this.client;
    const env = getEnv();
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    return this.client;
  }

  async generate(
    email: string,
    action: VerificationAction,
    ipAddress: string,
    requestId: string,
    expiresInMinutes: number = DEFAULT_EXPIRY_MINUTES,
  ): Promise<GenerateCodeResult> {
    const db = this.getClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await db
      .from('email_verification_codes')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('action', action)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= MAX_CODES_PER_HOUR) {
      logger.warn('Verification code rate limit exceeded', { requestId, email });
      throw new RateLimitError('Too many verification attempts. Please try again later.', 60);
    }

    const code = this.generateSecureCode();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await db.from('email_verification_codes').insert({
      email,
      code,
      action,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      session_id: requestId,
    });

    logger.info('Verification code generated', { requestId, email: email.substring(0, 3) + '***' });
    return { code, expiresAt };
  }

  async verify(
    email: string,
    action: VerificationAction,
    code: string,
    ipAddress: string,
    requestId: string,
  ): Promise<boolean> {
    const db = this.getClient();
    const now = new Date().toISOString();

    const { data: record } = await db
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('action', action)
      .eq('code', code)
      .is('used_at', null)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!record) {
      logger.warn('Invalid verification code', { requestId });
      throw new ValidationError('Invalid or expired verification code. Please try again.');
    }

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      logger.warn('Too many verification attempts for code', { requestId });
      throw new ValidationError('Too many verification attempts. Please request a new code.');
    }

    const newAttempts = (record.attempts ?? 0) + 1;

    await db
      .from('email_verification_codes')
      .update({
        used_at: now,
        attempts: newAttempts,
      })
      .eq('id', record.id);

    logger.info('Verification code verified', { requestId });
    return true;
  }

  private generateSecureCode(): string {
    const bytes = crypto.randomBytes(4);
    const num = bytes.readUInt32BE(0) % 1_000_000;
    return num.toString().padStart(6, '0');
  }
}
