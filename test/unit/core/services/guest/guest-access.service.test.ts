import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import { GuestAccessService } from '../../../../../src/core/services/guest/guest-access.service.js';
import type { IGuestAccessService } from '../../../../../src/core/ports/guest-access-service.port.js';
import type { IGuestSessionRepository, GuestSession } from '../../../../../src/core/ports/guest-session.port.js';

class MockGuestSessionRepository implements IGuestSessionRepository {
  public sessions = new Map<string, GuestSession>();

  addSession(token: string, session: GuestSession) {
    this.sessions.set(token, session);
  }

  async validateToken(token: string): Promise<GuestSession | null> {
    return this.sessions.get(token) ?? null;
  }

  async exchangeToken(rawToken: string): Promise<GuestSession | null> {
    return this.sessions.get(rawToken) ?? null;
  }
}

describe('GuestAccessService', () => {
  let mocks: TestMocks;
  let guestSessionRepo: MockGuestSessionRepository;
  let service: IGuestAccessService;

  const validSession: GuestSession = {
    token: 'valid-guest-token',
    email: 'guest@example.com',
    order_id: 'ord-guest-1',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();

    guestSessionRepo = new MockGuestSessionRepository();
    container.register(TOKENS.GuestSessionRepository, { useValue: guestSessionRepo });
    container.register(TOKENS.GuestAccessService, { useClass: GuestAccessService });

    service = container.resolve<IGuestAccessService>(TOKENS.GuestAccessService);
  });

  describe('getGuestOrder', () => {
    it('should return order detail for valid token and matching orderId', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);
      mocks.orderRepo.addOrder({
        id: 'ord-guest-1',
        user_id: 'guest@example.com',
        status: 'completed',
        total_cents: 4999,
        currency: 'usd',
      });

      const detail = await service.getGuestOrder('valid-guest-token', 'ord-guest-1');
      expect(detail.order.id).toBe('ord-guest-1');
    });

    it('should throw AuthenticationError for invalid token', async () => {
      await expect(
        service.getGuestOrder('bad-token', 'ord-guest-1'),
      ).rejects.toThrow('Invalid or expired guest session');
    });

    it('should throw ForbiddenError when orderId does not match session', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);

      await expect(
        service.getGuestOrder('valid-guest-token', 'ord-other'),
      ).rejects.toThrow('You do not have access to this order');
    });
  });

  describe('getGuestOrderKeys', () => {
    it('should return keys for valid guest session', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);
      mocks.orderRepo.addOrder({
        id: 'ord-guest-1',
        user_id: 'guest@example.com',
        status: 'completed',
        total_cents: 4999,
        currency: 'usd',
      });
      mocks.productKeyRepo.keys = [
        { id: 'key-1', order_item_id: 'item-1', key_state: 'available' },
      ];

      const keys = await service.getGuestOrderKeys('valid-guest-token', 'ord-guest-1');
      expect(keys).toHaveLength(1);
      expect(keys[0].id).toBe('key-1');
    });
  });

  describe('revealGuestKey', () => {
    it('should reveal key for valid guest session', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);
      mocks.orderRepo.addOrder({
        id: 'ord-guest-1',
        user_id: 'guest@example.com',
        status: 'completed',
        total_cents: 4999,
        currency: 'usd',
        payment_intent_id: 'pi_test',
      });
      mocks.paymentGateway.paymentStatus = {
        paid: true,
        status: 'succeeded',
        amount_cents: 4999,
        currency: 'usd',
      };

      const key = await service.revealGuestKey(
        'valid-guest-token',
        'ord-guest-1',
        'key-1',
        '127.0.0.1',
        'TestAgent/1.0',
      );
      expect(key).toBe('DECRYPTED-KEY-VALUE');
    });
  });

  describe('createGuestSupportTicket', () => {
    it('should create support ticket for valid guest session', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);

      const ticket = await service.createGuestSupportTicket('valid-guest-token', {
        subject: 'Missing key',
        message: 'I did not receive my product key',
      });

      expect(ticket.ticket_number).toBeDefined();
      expect(ticket.status).toBe('open');
    });

    it('should throw AuthenticationError for invalid token', async () => {
      await expect(
        service.createGuestSupportTicket('bad-token', {
          subject: 'Help',
          message: 'Need help',
        }),
      ).rejects.toThrow('Invalid or expired guest session');
    });

    it('should use session order_id when dto.order_id is not provided', async () => {
      guestSessionRepo.addSession('valid-guest-token', validSession);

      const ticket = await service.createGuestSupportTicket('valid-guest-token', {
        subject: 'Order issue',
        message: 'Problem with my order',
      });

      expect(ticket).toBeDefined();
      expect(ticket.subject).toBe('Order issue');
    });
  });
});
