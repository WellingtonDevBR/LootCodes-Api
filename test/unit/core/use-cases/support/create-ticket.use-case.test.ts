import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { CreateTicketUseCase } from '../../../../../src/core/use-cases/support/create-ticket.use-case.js';

describe('CreateTicketUseCase', () => {
  let mocks: TestMocks;
  let useCase: CreateTicketUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<CreateTicketUseCase>(UC_TOKENS.CreateTicket);
  });

  it('should create a ticket with valid input', async () => {
    const ticket = await useCase.execute(
      { subject: 'Help needed', message: 'I need assistance' },
      'user-1',
    );

    expect(ticket.ticket_number).toBeTruthy();
    expect(ticket.user_id).toBe('user-1');
    expect(ticket.subject).toBe('Help needed');
    expect(ticket.status).toBe('open');
  });

  it('should create a ticket without userId (guest)', async () => {
    const ticket = await useCase.execute({
      subject: 'Guest help',
      message: 'Guest issue',
      guest_email: 'guest@example.com',
    });

    expect(ticket.ticket_number).toBeTruthy();
    expect(ticket.user_id).toBeUndefined();
  });

  it('should reject empty subject', async () => {
    await expect(
      useCase.execute({ subject: '', message: 'Help' }, 'user-1'),
    ).rejects.toThrow('required');
  });

  it('should reject empty message', async () => {
    await expect(
      useCase.execute({ subject: 'Help', message: '' }, 'user-1'),
    ).rejects.toThrow('required');
  });

  it('should store the ticket in the repository', async () => {
    const ticket = await useCase.execute(
      { subject: 'Test', message: 'Body' },
      'user-1',
    );

    expect(mocks.supportTicketRepo.tickets.length).toBe(1);
    expect(mocks.supportTicketRepo.tickets[0].ticket.ticket_number).toBe(ticket.ticket_number);
  });
});
