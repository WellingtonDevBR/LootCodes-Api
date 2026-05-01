import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadAvatarUseCase } from '../../../../../src/core/use-cases/profile/upload-avatar.use-case.js';
import type { IAvatarStorage } from '../../../../../src/core/ports/avatar-storage.port.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  let avatarStorage: {
    upload: ReturnType<typeof vi.fn>;
    getUrl: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    avatarStorage = {
      upload: vi.fn(),
      getUrl: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new UploadAvatarUseCase(avatarStorage as unknown as IAvatarStorage);
  });

  it('should upload a valid avatar', async () => {
    const buffer = Buffer.alloc(1024);
    avatarStorage.upload.mockResolvedValue('https://storage.com/avatars/user-1.jpg');

    const url = await useCase.execute('user-1', buffer, 'image/jpeg');

    expect(url).toBe('https://storage.com/avatars/user-1.jpg');
    expect(avatarStorage.upload).toHaveBeenCalledWith('user-1', buffer, 'image/jpeg');
  });

  it('should reject an invalid MIME type', async () => {
    const buffer = Buffer.alloc(1024);

    await expect(useCase.execute('user-1', buffer, 'application/pdf')).rejects.toThrow(ValidationError);
    await expect(useCase.execute('user-1', buffer, 'application/pdf')).rejects.toThrow(
      'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
    );
  });

  it('should reject a file that exceeds 5MB', async () => {
    const buffer = Buffer.alloc(6 * 1024 * 1024);

    await expect(useCase.execute('user-1', buffer, 'image/png')).rejects.toThrow(ValidationError);
    await expect(useCase.execute('user-1', buffer, 'image/png')).rejects.toThrow(
      'File too large. Maximum size is 5MB',
    );
  });

  it('should accept all allowed MIME types', async () => {
    const buffer = Buffer.alloc(100);
    avatarStorage.upload.mockResolvedValue('https://storage.com/avatar.img');

    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      await expect(useCase.execute('user-1', buffer, mime)).resolves.toBe('https://storage.com/avatar.img');
    }
  });
});
