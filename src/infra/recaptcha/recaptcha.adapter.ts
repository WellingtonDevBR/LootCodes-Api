import { injectable } from 'tsyringe';
import type { IRecaptchaVerifier, RecaptchaAssessment } from '../../core/ports/recaptcha.port.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';
import { isValidIP, isPrivateOrLocalhost } from '../../shared/client-ip.js';

const logger = createLogger('recaptcha');

function sanitizeIpForAssessment(ip: string | undefined): string | undefined {
  if (!ip || ip === 'unknown') return undefined;
  if (!isValidIP(ip) || isPrivateOrLocalhost(ip)) return undefined;
  return ip;
}

@injectable()
export class RecaptchaAdapter implements IRecaptchaVerifier {
  async assess(params: {
    token: string;
    expectedAction: string;
    userIpAddress?: string;
    userAgent?: string;
  }): Promise<RecaptchaAssessment> {
    const env = getEnv();
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${env.RECAPTCHA_PROJECT_ID}/assessments?key=${env.RECAPTCHA_API_KEY}`;

    const sanitizedIp = sanitizeIpForAssessment(params.userIpAddress);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: params.token,
            siteKey: env.RECAPTCHA_SITE_KEY,
            expectedAction: params.expectedAction,
            ...(sanitizedIp ? { userIpAddress: sanitizedIp } : {}),
            ...(params.userAgent ? { userAgent: params.userAgent } : {}),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('reCAPTCHA API error', { status: response.status, body: errorText.slice(0, 500) });
        return { valid: false, score: 0, reasons: ['api_error'] };
      }

      const data = await response.json() as Record<string, unknown>;
      const tokenProperties = data.tokenProperties as Record<string, unknown> | undefined;
      const riskAnalysis = data.riskAnalysis as Record<string, unknown> | undefined;

      const valid = tokenProperties?.valid === true;
      const score = (riskAnalysis?.score as number) ?? 0;
      const reasons = (riskAnalysis?.reasons as string[]) ?? [];

      logger.info('reCAPTCHA assessment result', {
        valid,
        score,
        reasons,
        action: tokenProperties?.action,
        expectedAction: params.expectedAction,
        hasIp: !!sanitizedIp,
      });

      if (!valid) {
        logger.warn('reCAPTCHA token invalid', {
          invalidReason: tokenProperties?.invalidReason,
          hostname: tokenProperties?.hostname,
        });
      }

      return { valid, score, reasons };
    } catch (err) {
      logger.error('reCAPTCHA assessment failed', err as Error);
      return { valid: false, score: 0, reasons: ['network_error'] };
    }
  }
}
