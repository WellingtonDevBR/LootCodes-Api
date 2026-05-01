import type { RiskAssessment, RiskAssessmentInput } from '../services/payments/payment.types.js';

export interface IRiskAssessor {
  assess(input: RiskAssessmentInput): Promise<RiskAssessment>;
}
