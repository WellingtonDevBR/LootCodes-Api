import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import type { GetTicketUseCase } from '../../../../../src/core/use-cases/support/get-ticket.use-case.js';
import type { TicketDetail, SupportTicket, TicketMessage } from '../../../../../src/core/use-cases/support/support.types.js';

describe('GetTicketUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetTicketUseCase;

  const OWNER_ID = 'user-owner-123';
  const OTHER_USER_ID = 'user-other-456';
  const GUEST_EMAIL = 'guest@example.com';

  function buildTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
    return {
      id: 'ticket-1',
      ticket_number: 'TICKET-20260503-0001',
      user_id: OWNER_ID,
      subject: 'Test ticket',
      status: 'open',
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  function buildMessage(overrides: Partial<TicketMessage> = {}): TicketMessage {
    return {
      id: 'msg-1',
      ticket_id: 'ticket-1',
      sender_type: 'customer',
      message: 'Hello',
      is_internal: false,
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  function addTicketToRepo(detail: TicketDetail) {
    mocks.supportTicketRepo.tickets.push(detail);
  }

  beforeEach(() => {
    mocks = setupTestContainer();
    useCase = container.resolve<GetTicketUseCase>(UC_TOKENS.GetTicket);
  });

  it('returns ticket when user is the owner', async () => {
    addTicketToRepo({
      ticket: buildTicket(),
      messages: [buildMessage()],
      attachments: [],
    });

    const result = await useCase.execute('TICKET-20260503-0001', { userId: OWNER_ID });
    expect(result.success).toBe(true);
    expect(result.ticket.ticket_number).toBe('TICKET-20260503-0001');
  });

  it('throws NotFoundError when ticket does not exist', async () => {
    await expect(useCase.execute('NONEXISTENT', { userId: OWNER_ID }))
      .rejects.toThrow('Ticket not found');
  });

  it('throws NotFoundError when user is not the owner and no email match', async () => {
    addTicketToRepo({
      ticket: buildTicket(),
      messages: [buildMessage()],
      attachments: [],
    });

    await expect(useCase.execute('TICKET-20260503-0001', { userId: OTHER_USER_ID }))
      .rejects.toThrow('Ticket not found');
  });

  it('allows access via guest_email match', async () => {
    addTicketToRepo({
      ticket: buildTicket({ user_id: undefined, guest_email: GUEST_EMAIL }),
      messages: [buildMessage()],
      attachments: [],
    });

    const result = await useCase.execute('TICKET-20260503-0001', { email: GUEST_EMAIL });
    expect(result.success).toBe(true);
  });

  it('filters out is_internal messages for non-admin callers', async () => {
    addTicketToRepo({
      ticket: buildTicket(),
      messages: [
        buildMessage({ id: 'msg-public', is_internal: false }),
        buildMessage({ id: 'msg-internal', is_internal: true }),
      ],
      attachments: [],
    });

    const result = await useCase.execute('TICKET-20260503-0001', { userId: OWNER_ID });
    const messages = result.ticket.messages as TicketMessage[];
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('msg-public');
  });

  it('auto-links user_id when authenticated user matches guest_email', async () => {
    const ticket = buildTicket({
      user_id: undefined,
      guest_email: GUEST_EMAIL,
    });
    addTicketToRepo({
      ticket,
      messages: [buildMessage()],
      attachments: [],
    });

    const result = await useCase.execute('TICKET-20260503-0001', {
      userId: OWNER_ID,
      email: GUEST_EMAIL,
    });

    expect(result.success).toBe(true);
    expect(mocks.supportTicketRepo.tickets[0].ticket.user_id).toBe(OWNER_ID);
  });

  it('includes order data when ticket has an order', async () => {
    addTicketToRepo({
      ticket: buildTicket({ order_id: 'order-abc' }),
      messages: [buildMessage()],
      order: { order_number: 'ORD-12345', status: 'completed' },
      attachments: [],
    });

    const result = await useCase.execute('TICKET-20260503-0001', { userId: OWNER_ID });
    const order = result.ticket.order as Record<string, unknown>;
    expect(order).toBeTruthy();
    expect(order.order_number).toBe('ORD-12345');
  });

  it('includes attachments in the response', async () => {
    addTicketToRepo({
      ticket: buildTicket(),
      messages: [buildMessage()],
      attachments: [
        {
          id: 'att-1',
          ticket_id: 'ticket-1',
          file_name: 'screenshot.png',
          file_path: 'TICKET-20260503-0001/screenshot.png',
          file_url: 'https://signed.url/screenshot.png',
          file_size: 1024,
          mime_type: 'image/png',
          created_at: new Date().toISOString(),
        },
      ],
    });

    const result = await useCase.execute('TICKET-20260503-0001', { userId: OWNER_ID });
    const attachments = result.ticket.attachments as unknown[];
    expect(attachments).toHaveLength(1);
  });
});
