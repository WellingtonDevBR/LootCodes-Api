import { injectable } from 'tsyringe';
import type { IVerificationStorage } from '../../core/ports/verification-storage.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

@injectable()
export class SupabaseVerificationStorageAdapter implements IVerificationStorage {
  async upload(
    _path: string,
    _fileBuffer: Buffer,
    _contentType: string,
  ): Promise<string> {
    throw new InternalError('Verification storage not configured');
  }
}
