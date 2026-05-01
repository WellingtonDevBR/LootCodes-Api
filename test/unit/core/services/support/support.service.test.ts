import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ISupportService } from '../../../../../src/core/ports/support-service.port.js';

describe('SupportService', () => {
  let mocks: TestMocks;
  let service: ISupportService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<ISupportService>(TOKENS.SupportService);
  });

  describe('createTicket', () => {
    it('should create ticket', async () => {
      const ticket = await service.createTicket({ subject: 'Help', message: 'I need help' }, 'user-1');
      expect(ticket.ticket_number).toBeTruthy();
      expect(ticket.user_id).toBe('user-1');
    });

    it('should reject empty subject', async () => {
      await expect(service.createTicket({ subject: '', message: 'Help' }, 'user-1')).rejects.toThrow('required');
    });
  });

  describe('getTicket', () => {
    it('should return ticket when owned', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      const detail = await service.getTicket(created.ticket_number, 'user-1');
      expect(detail.ticket.ticket_number).toBe(created.ticket_number);
      expect(detail.messages.length).toBeGreaterThan(0);
    });

    it('should throw ForbiddenError when not owned', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      await expect(service.getTicket(created.ticket_number, 'user-2')).rejects.toThrow('do not have access');
    });

    it('should throw NotFoundError when missing', async () => {
      await expect(service.getTicket('T-nonexistent', 'user-1')).rejects.toThrow('not found');
    });
  });

  describe('addMessage', () => {
    it('should add message to owned ticket', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      await expect(service.addMessage({ ticket_number: created.ticket_number, message: 'Follow up' }, 'user-1')).resolves.not.toThrow();
    });

    it('should reject adding message to unowned ticket', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      await expect(service.addMessage({ ticket_number: created.ticket_number, message: 'Hacked' }, 'user-2')).rejects.toThrow('do not have access');
    });
  });

  describe('reopenTicket', () => {
    it('should reopen owned ticket', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      await expect(service.reopenTicket(created.ticket_number, 'user-1', 'Need more help')).resolves.not.toThrow();
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback for owned ticket', async () => {
      const created = await service.createTicket({ subject: 'Help', message: 'Help me' }, 'user-1');
      await expect(service.submitFeedback({ ticket_number: created.ticket_number, rating: 5, comment: 'Great' }, 'user-1')).resolves.not.toThrow();
    });
  });
});
