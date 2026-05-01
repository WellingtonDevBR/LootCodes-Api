import { injectable } from 'tsyringe';
import type { IAvatarStorage } from '../../core/ports/avatar-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

// TODO: Implement using Supabase Storage client once the storage SDK is integrated.
// The IDatabase port only covers PostgREST operations; file uploads require the
// Storage client which will be added as a separate port/adapter.

@injectable()
export class SupabaseAvatarStorageAdapter implements IAvatarStorage {
  async upload(_userId: string, _fileBuffer: Buffer, _mimeType: string): Promise<string> {
    throw new InternalError('Avatar storage not configured');
  }

  async getUrl(_userId: string): Promise<string | null> {
    throw new InternalError('Avatar storage not configured');
  }

  async delete(_userId: string): Promise<void> {
    throw new InternalError('Avatar storage not configured');
  }
}
