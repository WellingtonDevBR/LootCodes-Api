import { injectable } from 'tsyringe';
import type { IAttachmentStorage } from '../../core/ports/attachment-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

// TODO: Implement with Supabase Storage when ticket attachments are wired
@injectable()
export class SupabaseAttachmentStorageAdapter implements IAttachmentStorage {
  async upload(
    _ticketId: string,
    _fileBuffer: Buffer,
    _fileName: string,
    _mimeType: string,
  ): Promise<string> {
    throw new InternalError('Attachment storage not configured');
  }

  async getSignedUrl(_path: string): Promise<string> {
    throw new InternalError('Attachment storage not configured');
  }
}
