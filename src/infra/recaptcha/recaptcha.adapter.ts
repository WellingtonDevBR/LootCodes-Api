import { injectable } from 'tsyringe';
import type { IRecaptchaVerifier, RecaptchaAssessment } from '../../core/ports/recaptcha.port.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('recaptcha');

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

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: params.token,
            siteKey: env.RECAPTCHA_SITE_KEY,
            expectedAction: params.expectedAction,
            userIpAddress: params.userIpAddress,
            userAgent: params.userAgent,
          },
        }),
      });

      if (!response.ok) {
        logger.error('reCAPTCHA API error', { status: response.status });
        return { valid: false, score: 0, reasons: ['api_error'] };
      }

      const data = await response.json() as Record<string, unknown>;
      const tokenProperties = data.tokenProperties as Record<string, unknown> | undefined;
      const riskAnalysis = data.riskAnalysis as Record<string, unknown> | undefined;

      const valid = tokenProperties?.valid === true;
      const score = (riskAnalysis?.score as number) ?? 0;
      const reasons = (riskAnalysis?.reasons as string[]) ?? [];

      return { valid, score, reasons };
    } catch (err) {
      logger.error('reCAPTCHA assessment failed', err as Error);
      return { valid: false, score: 0, reasons: ['network_error'] };
    }
  }

}
