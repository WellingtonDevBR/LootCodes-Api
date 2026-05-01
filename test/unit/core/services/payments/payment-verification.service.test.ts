import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { PaymentVerificationService } from '../../../../../src/core/services/payments/payment-verification.service.js';
import { setupTestContainer } from '../../../../helpers/test-app.js';
import type { IPaymentVerifier } from '../../../../../src/core/ports/payment-verifier.port.js';
import type { IRiskAssessor } from '../../../../../src/core/ports/risk-assessor.port.js';
import type { IFulfillmentService } from '../../../../../src/core/ports/fulfillment-service.port.js';
import type {
  VerifyPaymentDto,
  PaymentVerificationResult,
  RiskAssessmentInput,
  RiskAssessment,
  FulfillmentResult,
} from '../../../../../src/core/services/payments/payment.types.js';
import { TOKENS } from '../../../../../src/di/tokens.js';

class MockPaymentVerifier implements IPaymentVerifier {
  public result: PaymentVerificationResult = { status: 'fulfilled', order_id: 'order-1' };
  async verifyPayment(_dto: VerifyPaymentDto): Promise<PaymentVerificationResult> {
    return this.result;
  }
}

class MockRiskAssessor implements IRiskAssessor {
  public assessment: RiskAssessment = {
    score: 10,
    level: 'low',
    factors: [],
    should_hold: false,
    should_block: false,
  };
  async assess(_input: RiskAssessmentInput): Promise<RiskAssessment> {
    return this.assessment;
  }
}

class MockFulfillment implements IFulfillmentService {
  public fulfillResult: FulfillmentResult = { fulfilled: true, order_id: 'order-1', keys_delivered: 2 };
  public holdCalled = false;
  public holdArgs: { orderId: string; reason: string; riskScore: number } | null = null;

  async fulfill(_orderId: string, _riskScore?: number): Promise<FulfillmentResult> {
    return this.fulfillResult;
  }

  async holdOrder(orderId: string, reason: string, riskScore: number): Promise<void> {
    this.holdCalled = true;
    this.holdArgs = { orderId, reason, riskScore };
  }
}

describe('PaymentVerificationService', () => {
  let service: PaymentVerificationService;
  let mockVerifier: MockPaymentVerifier;
  let mockRisk: MockRiskAssessor;
  let mockFulfillment: MockFulfillment;

  beforeEach(() => {
    setupTestContainer();

    mockVerifier = new MockPaymentVerifier();
    mockRisk = new MockRiskAssessor();
    mockFulfillment = new MockFulfillment();

    container.register(TOKENS.PaymentVerifier, { useValue: mockVerifier });
    container.register(TOKENS.RiskAssessor, { useValue: mockRisk });
    container.register(TOKENS.FulfillmentService, { useValue: mockFulfillment });

    service = container.resolve(PaymentVerificationService);
  });

  it('should verify payment and fulfill order on low risk', async () => {
    const dto: VerifyPaymentDto = { payment_intent_id: 'pi_test_123', order_id: 'order-1' };

    const result = await service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent');

    expect(result.status).toBe('fulfilled');
    expect(result.order_id).toBe('order-1');
  });

  it('should return blocked when risk assessment says should_block', async () => {
    mockRisk.assessment = {
      score: 95,
      level: 'critical',
      factors: ['velocity', 'proxy'],
      should_hold: false,
      should_block: true,
    };

    const dto: VerifyPaymentDto = { payment_intent_id: 'pi_test_456', order_id: 'order-2' };
    const result = await service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent');

    expect(result.status).toBe('blocked');
    expect(result.order_id).toBe('order-2');
  });

  it('should hold order when risk assessment says should_hold', async () => {
    mockRisk.assessment = {
      score: 70,
      level: 'high',
      factors: ['new_card'],
      should_hold: true,
      should_block: false,
    };

    const dto: VerifyPaymentDto = { payment_intent_id: 'pi_test_789', order_id: 'order-3' };
    const result = await service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent');

    expect(result.status).toBe('held');
    expect(result.order_id).toBe('order-3');
    expect(mockFulfillment.holdCalled).toBe(true);
    expect(mockFulfillment.holdArgs?.riskScore).toBe(70);
  });

  it('should return error when payment is not verified', async () => {
    mockVerifier.result = { status: 'pending_verification', message: 'Not succeeded' };

    const dto: VerifyPaymentDto = { payment_intent_id: 'pi_test_pending', order_id: 'order-4' };
    const result = await service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent');

    expect(result.status).toBe('error');
    expect(result.message).toBe('Payment not verified');
  });

  it('should throw ValidationError when payment_intent_id is empty', async () => {
    const dto: VerifyPaymentDto = { payment_intent_id: '' };

    await expect(
      service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent'),
    ).rejects.toThrow('Payment intent ID is required');
  });

  it('should propagate risk assessor errors', async () => {
    const originalAssess = mockRisk.assess.bind(mockRisk);
    mockRisk.assess = async () => {
      void originalAssess;
      throw new Error('Risk engine unavailable');
    };

    const dto: VerifyPaymentDto = { payment_intent_id: 'pi_test_err', order_id: 'order-5' };

    await expect(
      service.verifyAndFulfill(dto, '1.2.3.4', 'test-agent'),
    ).rejects.toThrow('Risk engine unavailable');
  });
});
