import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { CreateTicketUseCase } from '../../../../../src/core/use-cases/support/create-ticket.use-case.js';
import type { UploadAttachmentUseCase } from '../../../../../src/core/use-cases/support/upload-attachment.use-case.js';

describe('UploadAttachmentUseCase', () => {
  let mocks: TestMocks;
  let createTicket: CreateTicketUseCase;
  let uploadAttachment: UploadAttachmentUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    createTicket = container.resolve<CreateTicketUseCase>(UC_TOKENS.CreateTicket);
    uploadAttachment = container.resolve<UploadAttachmentUseCase>(UC_TOKENS.UploadAttachment);
  });

  it('should upload attachment for owned ticket', async () => {
    const ticket = await createTicket.execute(
      { subject: 'Help', message: 'Help me' },
      'user-1',
    );

    const url = await uploadAttachment.execute(
      ticket.ticket_number,
      'user-1',
      Buffer.from('fake-image-data'),
      'screenshot.png',
      'image/png',
    );

    expect(url).toContain('screenshot.png');
  });

  it('should reject attachment for unowned ticket', async () => {
    const ticket = await createTicket.execute(
      { subject: 'Help', message: 'Help me' },
      'user-1',
    );

    await expect(
      uploadAttachment.execute(
        ticket.ticket_number,
        'user-2',
        Buffer.from('fake'),
        'file.pdf',
        'application/pdf',
      ),
    ).rejects.toThrow('do not have access');
  });

  it('should reject attachment for nonexistent ticket', async () => {
    await expect(
      uploadAttachment.execute(
        'T-nonexistent',
        'user-1',
        Buffer.from('fake'),
        'file.pdf',
        'application/pdf',
      ),
    ).rejects.toThrow('not found');
  });
});
