import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAuthProvider } from '../../ports/auth.port.js';
import type { IRecaptchaVerifier } from '../../ports/recaptcha.port.js';
import { isAssessmentAcceptable, getRiskLevel } from '../../ports/recaptcha.port.js';
import type { IUserRepository } from '../../ports/user-repository.port.js';
import type { IRateLimiter } from '../../ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../ports/ip-blocklist.port.js';
import type { IVerificationCodeService } from '../../ports/verification-code.port.js';
import type { IEmailSender } from '../../ports/email.port.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';
import type { AuthRequestDto, AuthContext, AuthResult } from './auth.types.js';
import {
  ValidationError,
  AuthenticationError,
  RateLimitError,
  SecurityVerificationError,
  ForbiddenError,
} from '../../errors/domain-errors.js';
import {
  validateEmail,
  validateName,
  validateCountryCode,
} from '../../../shared/input-validation.js';
import { rateLimitIdentifier } from '../../../shared/client-ip.js';
import { maskEmail } from '../../../shared/pii.js';
import { createLogger } from '../../../shared/logger.js';
import { buildVerificationEmailHtml } from '../../../infra/email/templates/verification-email.js';

const logger = createLogger('handle-auth-use-case');

@injectable()
export class HandleAuthUseCase {
  constructor(
    @inject(TOKENS.AuthProvider) private auth: IAuthProvider,
    @inject(TOKENS.RecaptchaVerifier) private recaptcha: IRecaptchaVerifier,
    @inject(TOKENS.UserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.RateLimiter) private rateLimiter: IRateLimiter,
    @inject(TOKENS.IpBlocklist) private ipBlocklist: IIpBlocklist,
    @inject(TOKENS.VerificationCodeService) private verificationCode: IVerificationCodeService,
    @inject(TOKENS.EmailSender) private emailSender: IEmailSender,
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    const ipAddress = rateLimitIdentifier(ctx.ipAddress, {
      fingerprint: dto.fingerprint_hash,
      userAgent: ctx.userAgent,
    });

    await this.checkIpBlocked(ipAddress);

    if (dto.action === 'send-otp') {
      return this.handleSendOtp(dto, ctx);
    }
    if (dto.action === 'verify-otp') {
      return this.handleVerifyOtp(dto, ctx);
    }

    await this.checkRateLimit(ipAddress, dto, ctx);
    await this.verifyRecaptcha(dto, ctx);

    if (dto.action === 'password_reset') {
      return this.handlePasswordReset(dto, ctx);
    }
    if (dto.action === 'sign_in') {
      return this.handleSignIn(dto, ctx);
    }
    if (dto.action === 'sign_up') {
      return this.handleSignUp(dto, ctx);
    }

    throw new ValidationError('Invalid action');
  }

  private async handleSignIn(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    if (!dto.email || !dto.password) {
      throw new ValidationError('Email and password are required');
    }

    const emailResult = validateEmail(dto.email);
    if (!emailResult.isValid) throw new ValidationError(emailResult.error!);

    const existingUserId = await this.userRepo.findIdByEmail(emailResult.sanitized!);

    if (!existingUserId) {
      await this.timingJitter();
      logger.warn('Sign-in attempt for non-existent email', { requestId: ctx.requestId, ipAddress: ctx.ipAddress });
      throw new AuthenticationError('Invalid email or password');
    }

    try {
      const result = await this.auth.signInWithPassword(emailResult.sanitized!, dto.password);
      logger.info('Sign-in successful', { requestId: ctx.requestId, userId: result.user.id });

      const role = await this.resolveRole(result.user.id);

      return {
        success: true,
        user: { id: result.user.id, email: result.user.email },
        role,
        session: result.session
          ? {
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
              expires_in: result.session.expires_in,
            }
          : undefined,
      };
    } catch {
      logger.warn('Sign-in failed — invalid credentials', {
        requestId: ctx.requestId,
        email: maskEmail(dto.email),
      });
      throw new AuthenticationError('Invalid email or password');
    }
  }

  private async handleSignUp(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    if (!dto.email || !dto.password) {
      throw new ValidationError('Email and password are required');
    }
    if (!dto.full_name || !dto.country) {
      throw new ValidationError('Full name and country are required');
    }

    const emailResult = validateEmail(dto.email);
    if (!emailResult.isValid) throw new ValidationError(emailResult.error!);

    const nameResult = validateName(dto.full_name, { required: true, minLength: 2, maxLength: 50 });
    if (!nameResult.isValid) throw new ValidationError(nameResult.error!);

    const countryResult = validateCountryCode(dto.country);
    if (!countryResult.isValid) throw new ValidationError(countryResult.error!);

    if (!dto.email_verification_code) {
      return this.sendSignUpVerificationCode(emailResult.sanitized!, ctx);
    }

    return this.verifyAndCreateUser(dto, emailResult.sanitized!, nameResult.sanitized!, countryResult.sanitized!, ctx);
  }

  private async sendSignUpVerificationCode(email: string, ctx: AuthContext): Promise<AuthResult> {
    const { code, expiresAt } = await this.verificationCode.generate(
      email,
      'sign_up',
      ctx.ipAddress,
      ctx.requestId,
    );

    const expiresInMinutes = Math.round((expiresAt.getTime() - Date.now()) / 60_000);

    const html = buildVerificationEmailHtml({
      verificationCode: code,
      action: 'sign_up',
      userEmail: email,
      expiresInMinutes,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    await this.emailSender.send({
      to: email,
      subject: 'Verify your email — LootCodes',
      html,
    });

    logger.info('Verification code sent for sign-up', {
      requestId: ctx.requestId,
      email: maskEmail(email),
    });

    return {
      success: false,
      emailVerificationRequired: true,
      message: 'Email verification required',
    };
  }

  private async verifyAndCreateUser(
    dto: AuthRequestDto,
    email: string,
    fullName: string,
    country: string,
    ctx: AuthContext,
  ): Promise<AuthResult> {
    await this.verificationCode.verify(
      email,
      'sign_up',
      dto.email_verification_code!,
      ctx.ipAddress,
      ctx.requestId,
    );

    try {
      const existingId = await this.userRepo.findIdByEmail(email);

      if (existingId) {
        const existingUser = await this.auth.getUserById(existingId);
        if (!existingUser) {
          throw new ValidationError('Sign-up could not be completed. Please request a new code and try again.');
        }

        if (existingUser.email_confirmed_at) {
          logger.warn('Sign-up after OTP skipped — email already verified', {
            requestId: ctx.requestId,
            email: maskEmail(email),
          });
          throw new ValidationError(
            'This email already has an account. Please sign in instead, or reset your password if you forgot it.',
          );
        }

        const priorMeta =
          typeof existingUser.user_metadata === 'object' && existingUser.user_metadata !== null
            ? (existingUser.user_metadata as Record<string, unknown>)
            : {};

        await this.auth.updateUser(existingId, {
          password: dto.password,
          email_confirm: true,
          user_metadata: {
            ...priorMeta,
            full_name: fullName,
            country,
          },
        });

        const signIn = await this.auth.signInWithPassword(email, dto.password!);
        const session = signIn.session
          ? {
              access_token: signIn.session.access_token,
              refresh_token: signIn.session.refresh_token,
              expires_in: signIn.session.expires_in,
            }
          : undefined;

        logger.info('Sign-up completed for existing unconfirmed user (OTP)', {
          requestId: ctx.requestId,
          userId: existingId,
          email: maskEmail(email),
        });

        return {
          success: true,
          user: { id: existingId, email: existingUser.email ?? email },
          role: 'user',
          session,
        };
      }

      const result = await this.auth.signUp(email, dto.password!, {
        full_name: fullName,
        country,
      });

      logger.info('Sign-up successful', {
        requestId: ctx.requestId,
        userId: result.user.id,
        email: maskEmail(email),
      });

      return {
        success: true,
        user: { id: result.user.id, email: result.user.email ?? email },
        role: 'user',
        session: result.session
          ? {
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
              expires_in: result.session.expires_in,
            }
          : undefined,
      };
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      const message = err instanceof Error ? err.message : 'Sign-up failed';
      logger.error('Sign-up failed', err as Error, { requestId: ctx.requestId });
      throw new ValidationError(message);
    }
  }

  private async handlePasswordReset(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    if (!dto.email) throw new ValidationError('Email is required');

    const emailResult = validateEmail(dto.email);
    if (!emailResult.isValid) throw new ValidationError(emailResult.error!);

    try {
      await this.auth.resetPasswordForEmail(emailResult.sanitized!);
    } catch (err) {
      logger.error('Password reset failed', err as Error, { requestId: ctx.requestId });
    }

    return {
      success: true,
      message: 'If that email is registered, a reset link has been sent',
    };
  }

  private async handleSendOtp(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    if (!dto.phone) throw new ValidationError('Phone number is required');

    try {
      await this.auth.sendOtp(dto.phone);
      logger.info('OTP sent', { requestId: ctx.requestId });
      return { success: true, message: 'OTP sent' };
    } catch (err) {
      logger.error('OTP send failed', err as Error, { requestId: ctx.requestId });
      throw new ValidationError('Failed to send OTP');
    }
  }

  private async handleVerifyOtp(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult> {
    if (!dto.phone || !dto.otp_code) {
      throw new ValidationError('Phone and OTP code are required');
    }

    try {
      const result = await this.auth.verifyOtp(dto.phone, dto.otp_code);
      logger.info('OTP verified', { requestId: ctx.requestId, userId: result.user.id });

      const role = await this.resolveRole(result.user.id);

      return {
        success: true,
        user: { id: result.user.id, phone: result.user.phone },
        role,
        session: result.session
          ? {
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
              expires_in: result.session.expires_in,
            }
          : undefined,
      };
    } catch {
      throw new AuthenticationError('Invalid OTP');
    }
  }

  private async resolveRole(userId: string): Promise<string> {
    try {
      return (await this.userProfileRepo.getRole(userId)) ?? 'user';
    } catch {
      return 'user';
    }
  }

  private async checkIpBlocked(ipAddress: string): Promise<void> {
    try {
      const blocked = await this.ipBlocklist.isBlocked(ipAddress);
      if (blocked) throw new ForbiddenError('Access denied');
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
    }
  }

  private async checkRateLimit(ipAddress: string, dto: AuthRequestDto, ctx: AuthContext): Promise<void> {
    try {
      const config = await this.rateLimiter.getConfig('rate_limit_auth');

      const limit = ipAddress === 'unknown'
        ? config.perUnknownIpHourly
        : config.perIpHourly;

      const result = await this.rateLimiter.check({
        userId: null,
        ipAddress,
        endpoint: dto.action === 'password_reset' ? 'auth-password-reset' : 'auth-sign-in',
        limit,
        windowMinutes: 60,
      });

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', { requestId: ctx.requestId, ipAddress });
        throw new RateLimitError('Too many requests', 60);
      }
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      logger.warn('Rate limit check failed', err as Error, { requestId: ctx.requestId });
    }
  }

  private async verifyRecaptcha(dto: AuthRequestDto, ctx: AuthContext): Promise<void> {
    if (!dto.recaptcha_token) {
      throw new SecurityVerificationError('reCAPTCHA token is missing', 'RECAPTCHA_TOKEN_MISSING');
    }

    const assessment = await this.recaptcha.assess({
      token: dto.recaptcha_token,
      expectedAction: dto.action,
      userIpAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    if (!assessment.valid) {
      logger.warn('reCAPTCHA verification failed', {
        requestId: ctx.requestId,
        email: maskEmail(dto.email),
        reasons: assessment.reasons.join(','),
      });
      throw new SecurityVerificationError('Security verification failed');
    }

    if (!isAssessmentAcceptable(assessment, 0.3)) {
      logger.warn('reCAPTCHA score too low', {
        requestId: ctx.requestId,
        email: maskEmail(dto.email),
        score: assessment.score,
        action: dto.action,
      });
      throw new SecurityVerificationError('Your request appears suspicious. Please try again.');
    }

    ctx.riskLevel = getRiskLevel(assessment.score);
    ctx.score = assessment.score;
  }

  private async timingJitter(): Promise<void> {
    const jitter = 500 + Math.floor(Math.random() * 2000);
    await new Promise((r) => setTimeout(r, jitter));
  }
}
