import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICheckoutRepository } from '../../ports/checkout-repository.port.js';
import type { PaymentMethodsConfig } from './checkout.types.js';

@injectable()
export class GetPaymentMethodsConfigUseCase {
  constructor(
    @inject(TOKENS.CheckoutRepository) private checkoutRepo: ICheckoutRepository,
  ) {}

  async execute(): Promise<PaymentMethodsConfig> {
    return this.checkoutRepo.getPaymentMethodsConfig();
  }
}
