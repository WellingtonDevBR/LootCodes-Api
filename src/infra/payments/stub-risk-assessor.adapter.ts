import { injectable } from 'tsyringe';
import type { IRiskAssessor } from '../../core/ports/risk-assessor.port.js';
import type { RiskAssessmentInput, RiskAssessment } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('stub-risk-assessor');

@injectable()
export class StubRiskAssessorAdapter implements IRiskAssessor {
  async assess(input: RiskAssessmentInput): Promise<RiskAssessment> {
    logger.info('Stub risk assessment — returning low risk', {
      orderId: input.order_id,
      paymentIntentId: input.payment_intent_id,
    });

    return {
      score: 10,
      level: 'low',
      factors: [],
      should_hold: false,
      should_block: false,
    };
  }
}
