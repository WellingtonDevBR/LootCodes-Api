import type { RiskAssessment, RiskAssessmentInput } from '../use-cases/payments/payment.types.js';

export interface IRiskAssessor {
  assess(input: RiskAssessmentInput): Promise<RiskAssessment>;
}
