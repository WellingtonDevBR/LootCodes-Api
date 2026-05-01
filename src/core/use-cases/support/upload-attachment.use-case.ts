import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISupportTicketRepository } from '../../ports/support-ticket-repository.port.js';
import type { IAttachmentStorage } from '../../ports/attachment-storage.port.js';
import { NotFoundError, ForbiddenError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('upload-attachment');

@injectable()
export class UploadAttachmentUseCase {
  constructor(
    @inject(TOKENS.SupportTicketRepository) private ticketRepo: ISupportTicketRepository,
    @inject(TOKENS.AttachmentStorage) private attachmentStorage: IAttachmentStorage,
  ) {}

  async execute(
    ticketNumber: string,
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const detail = await this.ticketRepo.findByNumber(ticketNumber);
    if (!detail) {
      throw new NotFoundError('Ticket not found');
    }

    if (detail.ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    const url = await this.attachmentStorage.upload(
      detail.ticket.id,
      fileBuffer,
      fileName,
      mimeType,
    );

    logger.info('Attachment uploaded', { ticketNumber, userId, fileName });
    return url;
  }
}
