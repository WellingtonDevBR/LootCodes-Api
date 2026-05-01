import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IKeyDeliveryService } from '../../../../../src/core/ports/key-delivery-service.port.js';

describe('KeyDeliveryService', () => {
  let mocks: TestMocks;
  let service: IKeyDeliveryService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IKeyDeliveryService>(TOKENS.KeyDeliveryService);
  });

  describe('getKeysForOrder', () => {
    it('should return keys when order is owned', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd', payment_intent_id: 'pi_test' });
      const keys = await service.getKeysForOrder('ord-1', 'user-1');
      expect(keys).toEqual([]);
    });

    it('should throw ForbiddenError when order not owned', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-2', status: 'completed', total_cents: 2999, currency: 'usd' });
      await expect(service.getKeysForOrder('ord-1', 'user-1')).rejects.toThrow('You do not have access');
    });
  });

  describe('revealKey', () => {
    it('should reveal key when payment confirmed', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'completed', total_cents: 2999, currency: 'usd', payment_intent_id: 'pi_test' });
      mocks.paymentGateway.paymentStatus = { paid: true, status: 'succeeded' };

      const key = await service.revealKey('key-1', 'ord-1', 'user-1', '1.2.3.4', 'TestAgent');
      expect(key).toBe('DECRYPTED-KEY-VALUE');
    });

    it('should reject when payment not confirmed', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'pending', total_cents: 2999, currency: 'usd', payment_intent_id: 'pi_test' });
      mocks.paymentGateway.paymentStatus = { paid: false, status: 'requires_payment_method' };

      await expect(service.revealKey('key-1', 'ord-1', 'user-1', '1.2.3.4', 'TestAgent')).rejects.toThrow('Payment has not been confirmed');
    });

    it('should reject when order has no payment', async () => {
      mocks.orderRepo.addOrder({ id: 'ord-1', user_id: 'user-1', status: 'pending', total_cents: 2999, currency: 'usd' });
      await expect(service.revealKey('key-1', 'ord-1', 'user-1', '1.2.3.4', 'TestAgent')).rejects.toThrow('no associated payment');
    });
  });

  describe('checkKeyViewed', () => {
    it('should return false by default', async () => {
      const viewed = await service.checkKeyViewed('key-1', 'ord-1', 'user-1');
      expect(viewed).toBe(false);
    });
  });
});
