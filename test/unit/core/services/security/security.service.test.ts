import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ISecurityService } from '../../../../../src/core/ports/security-service.port.js';

describe('SecurityService', () => {
  let mocks: TestMocks;
  let service: ISecurityService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<ISecurityService>(TOKENS.SecurityService);
  });

  describe('getHold', () => {
    it('should return hold when found', async () => {
      mocks.securityHoldRepo.addHold({
        id: 'hold-1',
        status: 'pending',
        questions_asked: { questions: [], evidence: [] },
        response_deadline: '2026-06-01T00:00:00Z',
        guest_email: 'guest@test.com',
        order_id: 'order-1',
      });

      const hold = await service.getHold('hold-1');
      expect(hold.id).toBe('hold-1');
      expect(hold.status).toBe('pending');
    });

    it('should throw NotFoundError when hold does not exist', async () => {
      await expect(service.getHold('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('getHoldStatus', () => {
    it('should return status when hold exists', async () => {
      mocks.securityHoldRepo.addHold({
        id: 'hold-2',
        status: 'awaiting_response',
        questions_asked: { questions: [], evidence: [] },
        response_deadline: '2026-06-01T00:00:00Z',
        guest_email: 'guest@test.com',
        order_id: 'order-2',
      });

      const status = await service.getHoldStatus('hold-2');
      expect(status).toBe('awaiting_response');
    });

    it('should throw NotFoundError when hold does not exist', async () => {
      await expect(service.getHoldStatus('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document for existing hold', async () => {
      mocks.securityHoldRepo.addHold({
        id: 'hold-3',
        status: 'pending',
        questions_asked: { questions: [], evidence: [] },
        response_deadline: '2026-06-01T00:00:00Z',
        guest_email: 'guest@test.com',
        order_id: 'order-3',
      });

      const url = await service.uploadDocument('hold-3', 'docs/id.jpg', Buffer.from('test'), 'image/jpeg');
      expect(url).toContain('docs/id.jpg');
    });

    it('should throw NotFoundError when hold does not exist', async () => {
      await expect(
        service.uploadDocument('nonexistent', 'docs/id.jpg', Buffer.from('test'), 'image/jpeg'),
      ).rejects.toThrow('not found');
    });
  });

  describe('submitResponse', () => {
    it('should submit response when allowed', async () => {
      mocks.securityHoldRepo.addHold({
        id: 'hold-4',
        status: 'pending',
        questions_asked: { questions: [], evidence: [] },
        response_deadline: '2026-06-01T00:00:00Z',
        guest_email: 'guest@test.com',
        order_id: 'order-4',
      });

      await expect(
        service.submitResponse('hold-4', { responses: { q1: 'answer' }, evidence_urls: [] }, 'guest@test.com'),
      ).resolves.not.toThrow();
    });

    it('should throw RateLimitError when rate limited', async () => {
      mocks.securityHoldRepo.rateLimited = true;
      mocks.securityHoldRepo.addHold({
        id: 'hold-5',
        status: 'pending',
        questions_asked: { questions: [], evidence: [] },
        response_deadline: '2026-06-01T00:00:00Z',
        guest_email: 'guest@test.com',
        order_id: 'order-5',
      });

      await expect(
        service.submitResponse('hold-5', { responses: {}, evidence_urls: [] }, 'guest@test.com'),
      ).rejects.toThrow('Too many');
    });
  });
});
