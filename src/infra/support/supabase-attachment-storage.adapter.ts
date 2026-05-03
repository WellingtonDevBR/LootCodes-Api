import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAttachmentStorage } from '../../core/ports/attachment-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('attachment-storage');

const BUCKET = 'support-attachments';

@injectable()
export class SupabaseAttachmentStorageAdapter implements IAttachmentStorage {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async upload(
    ticketId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const path = `${ticketId}/${fileName}`;
    return this.doUpload(path, fileBuffer, mimeType);
  }

  async uploadPreTicket(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    return this.doUpload(fileName, fileBuffer, mimeType);
  }

  async getSignedUrl(_path: string): Promise<string> {
    throw new InternalError('Signed URL generation not configured');
  }

  private async doUpload(path: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const result = await this.db.rpc<{ url: string }>('storage_upload', {
      p_bucket: BUCKET,
      p_path: path,
      p_file_base64: fileBuffer.toString('base64'),
      p_content_type: mimeType,
      p_upsert: false,
    });

    if (!result?.url) {
      throw new InternalError('Failed to upload support attachment');
    }

    logger.info('Support attachment uploaded', { path });
    return path;
  }
}
