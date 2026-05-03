import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IStorageProvider } from '../../core/ports/storage-provider.port.js';
import type { IAttachmentStorage } from '../../core/ports/attachment-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('attachment-storage');

const BUCKET = 'support-attachments';
const SIGNED_URL_EXPIRY_SECONDS = 3600;

@injectable()
export class SupabaseAttachmentStorageAdapter implements IAttachmentStorage {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
    @inject(TOKENS.StorageProvider) private storage: IStorageProvider,
  ) {}

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

  async getSignedUrl(path: string, bucket = BUCKET): Promise<string> {
    return this.storage.createSignedUrl(bucket, path, SIGNED_URL_EXPIRY_SECONDS);
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
