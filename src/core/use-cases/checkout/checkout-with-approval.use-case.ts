import { injectable, inject } from 'tsyringe';
import { UC_TOKENS } from '../../../di/tokens.js';
import type { ISecurityHoldRepository } from '../../ports/security-hold-repository.port.js';
import { TOKENS } from '../../../di/tokens.js';
import type { CheckoutApprovalDto, CheckoutResult } from './checkout.types.js';
import { ValidationError, ForbiddenError } from '../../errors/domain-errors.js';
import type { InitializeCheckoutUseCase } from './initialize-checkout.use-case.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('checkout-with-approval-use-case');

@injectable()
export class CheckoutWithApprovalUseCase {
  constructor(
    @inject(TOKENS.SecurityHoldRepository) private securityHoldRepo: ISecurityHoldRepository,
    @inject(UC_TOKENS.InitializeCheckout) private initCheckout: InitializeCheckoutUseCase,
  ) {}

  async execute(
    dto: CheckoutApprovalDto,
    userId?: string,
    ipAddress?: string,
  ): Promise<CheckoutResult> {
    if (!dto.items.length) {
      throw new ValidationError('Cart is empty');
    }

    const resolution = await this.securityHoldRepo.resolveByToken(dto.approval_token);
    if (!resolution.success) {
      throw new ForbiddenError(resolution.error ?? 'Invalid or expired approval token');
    }

    logger.info('Security hold approved for checkout', { holdId: dto.hold_id });

    return this.initCheckout.execute(
      {
        items: dto.items,
        currency: dto.currency,
        promo_code: dto.promo_code,
        session_id: dto.session_id,
        wallet_redeem_cents: dto.wallet_redeem_cents,
        customer_email: dto.customer_email,
        customer_name: dto.customer_name,
        billing_address: dto.billing_address,
      },
      userId,
      ipAddress,
    );
  }
}
