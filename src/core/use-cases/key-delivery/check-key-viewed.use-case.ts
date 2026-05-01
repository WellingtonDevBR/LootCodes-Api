import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';

@injectable()
export class CheckKeyViewedUseCase {
  constructor(
    @inject(TOKENS.ProductKeyRepository) private keyRepo: IProductKeyRepository,
  ) {}

  async execute(keyId: string, orderId: string, userId: string): Promise<boolean> {
    return this.keyRepo.checkKeyViewed(keyId, orderId, userId);
  }
}
