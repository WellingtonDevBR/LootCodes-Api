export interface RecaptchaAssessment {
  valid: boolean;
  score: number;
  reasons: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface IRecaptchaVerifier {
  assess(params: {
    token: string;
    expectedAction: string;
    userIpAddress?: string;
    userAgent?: string;
  }): Promise<RecaptchaAssessment>;
}

export function isAssessmentAcceptable(assessment: RecaptchaAssessment, threshold: number): boolean {
  return assessment.valid && assessment.score >= threshold;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 0.7) return 'low';
  if (score >= 0.3) return 'medium';
  return 'high';
}
