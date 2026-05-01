import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IWalletService } from '../../../../../src/core/ports/wallet-service.port.js';

describe('WalletService', () => {
  let mocks: TestMocks;
  let service: IWalletService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IWalletService>(TOKENS.WalletService);
  });

  describe('getBalance', () => {
    it('should return wallet balance for user', async () => {
      mocks.walletRepo.balance = {
        balance_cents: 1500,
        lifetime_credited_cents: 5000,
        lifetime_redeemed_cents: 3500,
        expiring_soon_cents: 500,
        next_expiry: '2026-06-01T00:00:00Z',
      };

      const balance = await service.getBalance('user-1');
      expect(balance.balance_cents).toBe(1500);
      expect(balance.lifetime_credited_cents).toBe(5000);
      expect(balance.lifetime_redeemed_cents).toBe(3500);
      expect(balance.expiring_soon_cents).toBe(500);
      expect(balance.next_expiry).toBe('2026-06-01T00:00:00Z');
    });

    it('should return zero balance by default', async () => {
      const balance = await service.getBalance('user-1');
      expect(balance.balance_cents).toBe(0);
      expect(balance.lifetime_credited_cents).toBe(0);
      expect(balance.lifetime_redeemed_cents).toBe(0);
    });
  });

  describe('listLedger', () => {
    it('should return ledger entries', async () => {
      mocks.walletRepo.ledgerEntries = [
        { id: 'entry-1', amount_cents: 500, reason: 'reward', order_id: 'order-1', created_at: '2026-01-01T00:00:00Z' },
        { id: 'entry-2', amount_cents: -200, reason: 'redemption', order_id: null, created_at: '2026-01-02T00:00:00Z' },
      ];

      const result = await service.listLedger('user-1');
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].amount_cents).toBe(500);
      expect(result.entries[1].amount_cents).toBe(-200);
    });

    it('should pass pagination params to repository', async () => {
      mocks.walletRepo.ledgerEntries = [
        { id: 'entry-3', amount_cents: 100, reason: 'referral', created_at: '2026-01-03T00:00:00Z' },
      ];
      mocks.walletRepo.nextCursor = 'cursor-abc';

      const result = await service.listLedger('user-1', { limit: 10, before: 'entry-5' });
      expect(result.entries).toHaveLength(1);
      expect(result.nextCursor).toBe('cursor-abc');
    });
  });

  describe('getOrderEarnings', () => {
    it('should return earnings for valid order ids', async () => {
      mocks.walletRepo.orderEarnings = [
        { order_id: 'order-1', earned_cents: 150, reward_cents: 100, referral_cents: 50, reward_expires_at: '2026-12-01T00:00:00Z', reasons: ['purchase_reward'] },
      ];

      const earnings = await service.getOrderEarnings('user-1', ['order-1']);
      expect(earnings).toHaveLength(1);
      expect(earnings[0].earned_cents).toBe(150);
      expect(earnings[0].reward_cents).toBe(100);
      expect(earnings[0].referral_cents).toBe(50);
    });

    it('should reject empty order_ids array', async () => {
      await expect(service.getOrderEarnings('user-1', [])).rejects.toThrow('must not be empty');
    });

    it('should reject more than 200 order_ids', async () => {
      const ids = Array.from({ length: 201 }, (_, i) => `order-${i}`);
      await expect(service.getOrderEarnings('user-1', ids)).rejects.toThrow('at most 200');
    });

    it('should reject order_ids with empty strings', async () => {
      await expect(service.getOrderEarnings('user-1', ['order-1', '', 'order-3'])).rejects.toThrow('empty strings');
    });
  });
});
