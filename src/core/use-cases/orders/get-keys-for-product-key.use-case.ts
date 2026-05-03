import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';
import type { ProductKey } from './order.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('get-keys-for-product-key');

@injectable()
export class GetKeysForProductKeyUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
    @inject(TOKENS.ProductKeyRepository) private keyRepo: IProductKeyRepository,
  ) {}

  async execute(
    productKeyId: string,
    _userId?: string,
  ): Promise<{ orderItemId: string; keys: ProductKey[] } | null> {
    const lookup = await this.orderRepo.getProductKeyLookup(productKeyId);
    if (!lookup?.order_id || !lookup?.variant_id) {
      logger.warn('Product key has no associated order or variant', { productKeyId });
      return null;
    }

    const orderItemId = await this.orderRepo.findOrderItemId(lookup.order_id, lookup.variant_id);
    if (!orderItemId) {
      logger.warn('Could not find order item for this key', {
        productKeyId,
        orderId: lookup.order_id,
        variantId: lookup.variant_id,
      });
      return null;
    }

    const keys = await this.keyRepo.getKeysForOrderItem(orderItemId);
    return { orderItemId, keys };
  }
}
