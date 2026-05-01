import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IPromoCodeValidator } from '../../ports/promo-code-validator.port.js';
import type { PromoValidationResult } from './checkout.types.js';

@injectable()
export class ValidatePromoCodeUseCase {
  constructor(
    @inject(TOKENS.PromoCodeValidator) private promoValidator: IPromoCodeValidator,
  ) {}

  async execute(
    code: string,
    items: { variant_id: string; quantity: number }[],
    userId?: string,
  ): Promise<PromoValidationResult> {
    return this.promoValidator.validate(code, items, userId);
  }
}
