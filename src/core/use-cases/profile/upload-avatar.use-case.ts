import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IAvatarStorage } from '../../ports/avatar-storage.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('upload-avatar');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@injectable()
export class UploadAvatarUseCase {
  constructor(
    @inject(TOKENS.AvatarStorage) private avatarStorage: IAvatarStorage,
  ) {}

  async execute(userId: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    if (!ALLOWED_MIMES.includes(mimeType)) {
      throw new ValidationError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    if (fileBuffer.length > MAX_SIZE_BYTES) {
      throw new ValidationError('File too large. Maximum size is 5MB');
    }

    logger.info('Uploading avatar', { userId, mimeType, size: fileBuffer.length });
    return this.avatarStorage.upload(userId, fileBuffer, mimeType);
  }
}
