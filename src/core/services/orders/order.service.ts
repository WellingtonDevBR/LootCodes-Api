import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import type { IOrderService } from '../../ports/order-service.port.js';
import type { Order, OrderDetail, PaginationParams } from './order.types.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('order-service');

@injectable()
export class OrderService implements IOrderService {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
    @inject(TOKENS.OrderAccessTokenRepository) private tokenRepo: IOrderAccessTokenRepository,
  ) {}

  async getOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user_id !== userId) {
      logger.warn('Order access denied — user mismatch', { orderId, userId });
      throw new ForbiddenError('You do not have access to this order');
    }

    return order;
  }

  async getOrderDetail(orderId: string, userId: string): Promise<OrderDetail> {
    const detail = await this.orderRepo.getOrderDetail(orderId);
    if (!detail) {
      throw new NotFoundError('Order not found');
    }

    if (detail.order.user_id !== userId) {
      logger.warn('Order detail access denied — user mismatch', { orderId, userId });
      throw new ForbiddenError('You do not have access to this order');
    }

    return detail;
  }

  async getUserOrders(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId, pagination);
  }

  async getUserOrdersForSupport(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserForSupport(userId);
  }

  async validateAccessToken(token: string, orderId: string): Promise<boolean> {
    const accessToken = await this.tokenRepo.validate(token, orderId);
    return accessToken !== null;
  }

  async claimGuestOrder(token: string, userId: string): Promise<void> {
    logger.info('Claiming guest order', { userId });
    await this.tokenRepo.claimToUser(token, userId);
  }
}
