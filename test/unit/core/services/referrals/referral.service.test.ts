import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IReferralService } from '../../../../../src/core/ports/referral-service.port.js';

describe('ReferralService', () => {
  let mocks: TestMocks;
  let service: IReferralService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IReferralService>(TOKENS.ReferralService);
  });

  describe('getMe', () => {
    it('should return referral info for user', async () => {
      mocks.referralRepo.meData.set('user-1', {
        referral_code: 'ABC123',
        can_refer: true,
        stats: { pending: 2, completed: 5, disputed: 0, invalidated: 1, earned_cents: 5000 },
        referred_by: null,
        reward_policy: { referrer_percent_bps: 500, referrer_flat_cents: 0, referrer_min_cents: 50, referrer_max_cents: 5000, referee_welcome_flat_cents: 200, min_qualifying_subtotal_cents: 1000, min_qualifying_cash_cents: 500, ttl_days: 90 },
      });
      const result = await service.getMe('user-1');
      expect(result).not.toBeNull();
      expect(result!.referral_code).toBe('ABC123');
      expect(result!.stats.completed).toBe(5);
    });

    it('should return null for unknown user', async () => {
      const result = await service.getMe('unknown-user');
      expect(result).toBeNull();
    });
  });

  describe('listReferrals', () => {
    it('should return referral list page', async () => {
      mocks.referralRepo.referralPages.set('user-1', {
        entries: [
          { id: 'ref-1', status: 'completed', referral_code: 'ABC123', counterparty_display_name: 'Jane', grant_cents: 500, qualifying_order_id: 'order-1', qualifying_progress_cents: 2000, dispute_reason: null, dispute_resolution: null, invalidated_reason: null, created_at: '2026-01-01T00:00:00Z', completed_at: '2026-01-15T00:00:00Z', dispute_opened_at: null, dispute_resolved_at: null },
        ],
        nextCursor: null,
        role: 'referrer',
      });
      const page = await service.listReferrals('user-1', { role: 'referrer' });
      expect(page.entries).toHaveLength(1);
      expect(page.entries[0].status).toBe('completed');
      expect(page.role).toBe('referrer');
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard entries', async () => {
      mocks.referralRepo.leaderboard = [
        { rank: 1, display_name: 'Alice', referral_count: 50, earned_cents: 25000 },
        { rank: 2, display_name: 'Bob', referral_count: 30, earned_cents: 15000 },
      ];
      const entries = await service.getLeaderboard({ days: 30, limit: 10 });
      expect(entries).toHaveLength(2);
      expect(entries[0].rank).toBe(1);
    });

    it('should clamp days to 1-365', async () => {
      mocks.referralRepo.leaderboard = [];
      await service.getLeaderboard({ days: 0, limit: 10 });
      expect(mocks.referralRepo.lastLeaderboardParams?.days).toBe(1);

      await service.getLeaderboard({ days: 999, limit: 10 });
      expect(mocks.referralRepo.lastLeaderboardParams?.days).toBe(365);
    });

    it('should clamp limit to 1-100', async () => {
      mocks.referralRepo.leaderboard = [];
      await service.getLeaderboard({ days: 30, limit: 0 });
      expect(mocks.referralRepo.lastLeaderboardParams?.limit).toBe(1);

      await service.getLeaderboard({ days: 30, limit: 200 });
      expect(mocks.referralRepo.lastLeaderboardParams?.limit).toBe(100);
    });
  });

  describe('openDispute', () => {
    it('should open dispute with valid params', async () => {
      const result = await service.openDispute('user-1', {
        referral_id: 'ref-123',
        reason: 'This referral was not legitimate and I want to dispute it.',
      });
      expect(result.ok).toBe(true);
      expect(result.referral_id).toBe('ref-123');
    });

    it('should reject empty referral_id', async () => {
      await expect(
        service.openDispute('user-1', { referral_id: '', reason: 'A valid reason that is long enough' }),
      ).rejects.toThrow('referral_id is required');
    });

    it('should reject reason shorter than 10 characters', async () => {
      await expect(
        service.openDispute('user-1', { referral_id: 'ref-123', reason: 'short' }),
      ).rejects.toThrow('at least 10 characters');
    });

    it('should reject reason longer than 1000 characters', async () => {
      const longReason = 'x'.repeat(1001);
      await expect(
        service.openDispute('user-1', { referral_id: 'ref-123', reason: longReason }),
      ).rejects.toThrow('at most 1000 characters');
    });
  });
});
