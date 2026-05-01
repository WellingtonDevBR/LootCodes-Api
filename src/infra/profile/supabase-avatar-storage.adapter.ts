import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IAvatarStorage } from '../../core/ports/avatar-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('avatar-storage');

const BUCKET = 'avatars';

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@injectable()
export class SupabaseAvatarStorageAdapter implements IAvatarStorage {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async upload(userId: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const extension = MIME_TO_EXTENSION[mimeType];
    if (!extension) {
      throw new InternalError(`Unsupported avatar mime type: ${mimeType}`);
    }

    const path = `${userId}/avatar.${extension}`;

    const result = await this.db.rpc<{ url: string }>('storage_upload', {
      p_bucket: BUCKET,
      p_path: path,
      p_file_base64: fileBuffer.toString('base64'),
      p_content_type: mimeType,
      p_upsert: true,
    });

    if (!result?.url) {
      throw new InternalError('Failed to upload avatar');
    }

    logger.info('Avatar uploaded', { userId, path });
    return result.url;
  }

  async getUrl(userId: string): Promise<string | null> {
    const result = await this.db.rpc<{ url: string | null }>('storage_get_public_url', {
      p_bucket: BUCKET,
      p_path: `${userId}/avatar`,
    });

    return result?.url ?? null;
  }

  async delete(userId: string): Promise<void> {
    await this.db.rpc('storage_delete', {
      p_bucket: BUCKET,
      p_path_prefix: `${userId}/`,
    });
    logger.info('Avatar deleted', { userId });
  }
}
