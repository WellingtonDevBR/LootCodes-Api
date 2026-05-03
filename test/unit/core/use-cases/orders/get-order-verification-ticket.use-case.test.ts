import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IOrderRepository } from '../../../../../src/core/ports/order-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../../../../src/core/ports/order-access-token-repository.port.js';
import type { ISupportTicketRepository } from '../../../../../src/core/ports/support-ticket-repository.port.js';
import { GetOrderVerificationTicketUseCase } from '../../../../../src/core/use-cases/orders/get-order-verification-ticket.use-case.js';
import { ForbiddenError, NotFoundError, AuthenticationError } from '../../../../../src/core/errors/domain-errors.js';

describe('GetOrderVerificationTicketUseCase', () => {
  let orderRepo: { findById: ReturnType<typeof vi.fn> };
  let accessTokenRepo: { validate: ReturnType<typeof vi.fn> };
  let ticketRepo: { findVerificationTicketForOrder: ReturnType<typeof vi.fn> };
  let uc: GetOrderVerificationTicketUseCase;

  const orderId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    orderRepo = { findById: vi.fn() };
    accessTokenRepo = { validate: vi.fn() };
    ticketRepo = { findVerificationTicketForOrder: vi.fn() };

    uc = new GetOrderVerificationTicketUseCase(
      orderRepo as unknown as IOrderRepository,
      accessTokenRepo as unknown as IOrderAccessTokenRepository,
      ticketRepo as unknown as ISupportTicketRepository,
    );
  });

  it('throws AuthenticationError when no session user and no access token', async () => {
    await expect(
      uc.execute({ orderId, queryType: 'all' }),
    ).rejects.toThrow(AuthenticationError);
  });

  it('loads ticket for session owner', async () => {
    orderRepo.findById.mockResolvedValue({
      id: orderId,
      user_id: 'user-1',
      status: 'completed',
      total_cents: 100,
      currency: 'usd',
    });
    ticketRepo.findVerificationTicketForOrder.mockResolvedValue({
      id: 't1',
      ticket_number: 'TK-001',
      status: 'open',
      ticket_type: 'id_verification',
    });

    const result = await uc.execute({
      orderId,
      sessionUserId: 'user-1',
      queryType: 'all',
    });

    expect(result).toEqual({
      id: 't1',
      ticket_number: 'TK-001',
      status: 'open',
      ticket_type: 'id_verification',
    });
    expect(ticketRepo.findVerificationTicketForOrder).toHaveBeenCalledWith(orderId, [
      'id_verification',
      'security_verification',
    ]);
    expect(accessTokenRepo.validate).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when owner session but order missing', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(
      uc.execute({ orderId, sessionUserId: 'user-1', queryType: 'all' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when session user does not own order', async () => {
    orderRepo.findById.mockResolvedValue({
      id: orderId,
      user_id: 'someone-else',
      status: 'completed',
      total_cents: 100,
      currency: 'usd',
    });

    await expect(
      uc.execute({ orderId, sessionUserId: 'user-1', queryType: 'all' }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('loads ticket for guest with valid access token', async () => {
    accessTokenRepo.validate.mockResolvedValue({ token: 'g', order_id: orderId, email: 'a@b.c', expires_at: '', created_at: '' });
    ticketRepo.findVerificationTicketForOrder.mockResolvedValue(null);

    const result = await uc.execute({
      orderId,
      orderAccessToken: 'guest-valid',
      queryType: 'id_verification',
    });

    expect(result).toBeNull();
    expect(accessTokenRepo.validate).toHaveBeenCalledWith('guest-valid', orderId);
    expect(orderRepo.findById).not.toHaveBeenCalled();
    expect(ticketRepo.findVerificationTicketForOrder).toHaveBeenCalledWith(orderId, ['id_verification']);
  });

  it('throws ForbiddenError for invalid guest access token', async () => {
    accessTokenRepo.validate.mockResolvedValue(null);

    await expect(
      uc.execute({ orderId, orderAccessToken: 'bad', queryType: 'all' }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('prioritizes session ownership over guest token when session user is set', async () => {
    orderRepo.findById.mockResolvedValue({
      id: orderId,
      user_id: 'user-1',
      status: 'completed',
      total_cents: 100,
      currency: 'usd',
    });
    ticketRepo.findVerificationTicketForOrder.mockResolvedValue(null);

    await uc.execute({
      orderId,
      sessionUserId: 'user-1',
      orderAccessToken: 'should-not-be-checked',
      queryType: 'all',
    });

    expect(accessTokenRepo.validate).not.toHaveBeenCalled();
  });
});
