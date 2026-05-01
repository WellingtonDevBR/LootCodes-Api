import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';
import type { ProductKey } from '../orders/order.types.js';

@injectable()
export class GetKeysForOrderItemUseCase {
  constructor(
    @inject(TOKENS.ProductKeyRepository) private keyRepo: IProductKeyRepository,
  ) {}

  async execute(orderItemId: string, _userId: string): Promise<ProductKey[]> {
    return this.keyRepo.getKeysForOrderItem(orderItemId);
  }
}
