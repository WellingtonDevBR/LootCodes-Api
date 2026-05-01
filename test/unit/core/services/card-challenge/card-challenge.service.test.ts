import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ICardChallengeService } from '../../../../../src/core/ports/card-challenge-service.port.js';

describe('CardChallengeService', () => {
  let mocks: TestMocks;
  let service: ICardChallengeService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<ICardChallengeService>(TOKENS.CardChallengeService);
  });

  describe('startChallenge', () => {
    it('should start a challenge with valid data', async () => {
      const result = await service.startChallenge({
        order_id: 'order-1',
        payment_method_id: 'pm_test_123',
      });

      expect(result.challenge_id).toBeTruthy();
      expect(result.status).toBe('pending');
    });

    it('should reject empty order_id', async () => {
      await expect(
        service.startChallenge({ order_id: '', payment_method_id: 'pm_test_123' }),
      ).rejects.toThrow('order_id is required');
    });

    it('should reject empty payment_method_id', async () => {
      await expect(
        service.startChallenge({ order_id: 'order-1', payment_method_id: '' }),
      ).rejects.toThrow('payment_method_id is required');
    });
  });

  describe('verify', () => {
    it('should verify a pending challenge', async () => {
      const started = await service.startChallenge({
        order_id: 'order-2',
        payment_method_id: 'pm_test_456',
      });

      const result = await service.verify(started.challenge_id, { amount_cents: 42 });
      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('attempts_remaining');
    });

    it('should throw NotFoundError for nonexistent challenge', async () => {
      await expect(
        service.verify('nonexistent', { amount_cents: 42 }),
      ).rejects.toThrow('not found');
    });

    it('should reject verification on expired challenge', async () => {
      const started = await service.startChallenge({
        order_id: 'order-3',
        payment_method_id: 'pm_test_789',
      });

      mocks.cardChallengeRepo.setStatus(started.challenge_id, 'expired');

      await expect(
        service.verify(started.challenge_id, { amount_cents: 42 }),
      ).rejects.toThrow('expired');
    });
  });

  describe('chooseId', () => {
    it('should choose ID verification for pending challenge', async () => {
      const started = await service.startChallenge({
        order_id: 'order-4',
        payment_method_id: 'pm_test_abc',
      });

      const result = await service.chooseId(started.challenge_id);
      expect(result.ok).toBe(true);
    });

    it('should reject chooseId for non-pending challenge', async () => {
      const started = await service.startChallenge({
        order_id: 'order-5',
        payment_method_id: 'pm_test_def',
      });

      mocks.cardChallengeRepo.setStatus(started.challenge_id, 'verified');

      await expect(
        service.chooseId(started.challenge_id),
      ).rejects.toThrow('pending');
    });
  });
});
