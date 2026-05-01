import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IOrderService } from '../../../../../src/core/ports/order-service.port.js';

describe('OrderService', () => {
  let mocks: TestMocks;
  let service: IOrderService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IOrderService>(TOKENS.OrderService);
  });

  describe('getOrder', () => {
    it('should return order when found and owned', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd' });
      const order = await service.getOrder('ord-1', 'user-1');
      expect(order.id).toBe('ord-1');
    });

    it('should throw NotFoundError when order missing', async () => {
      await expect(service.getOrder('nonexistent', 'user-1')).rejects.toThrow('Order not found');
    });

    it('should throw ForbiddenError when user mismatch', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-2', status: 'completed', total_cents: 2999, currency: 'usd' });
      await expect(service.getOrder('ord-1', 'user-1')).rejects.toThrow('You do not have access');
    });
  });

  describe('getOrderDetail', () => {
    it('should return order detail with items', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd' });
      const detail = await service.getOrderDetail('ord-1', 'user-1');
      expect(detail.order.id).toBe('ord-1');
      expect(detail.items).toEqual([]);
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd' });
      mocks.orderRepo.addOrder({ id: 'ord-2', user_id: 'user-2', status: 'completed', total_cents: 1999, currency: 'usd' });
      const orders = await service.getUserOrders('user-1');
      expect(orders.length).toBe(1);
      expect(orders[0].id).toBe('ord-1');
    });
  });

  describe('validateAccessToken', () => {
    it('should return true for valid token', async () => {
      await mocks.orderAccessTokenRepo.generate('ord-1', 'guest@example.com');
      const valid = await service.validateAccessToken('token-ord-1', 'ord-1');
      expect(valid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const valid = await service.validateAccessToken('bad-token', 'ord-1');
      expect(valid).toBe(false);
    });
  });

  describe('claimGuestOrder', () => {
    it('should claim guest order', async () => {
      await expect(service.claimGuestOrder('some-token', 'user-1')).resolves.not.toThrow();
    });
  });
});
