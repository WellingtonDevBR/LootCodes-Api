import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserLibraryRepository } from '../../core/ports/user-library-repository.port.js';
import type { LibraryEntry, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../core/services/library/library.types.js';

@injectable()
export class SupabaseUserLibraryRepository implements IUserLibraryRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async list(userId: string): Promise<LibraryEntry[]> {
    return this.db.query<LibraryEntry>('user_library', {
      eq: [['user_id', userId]],
      order: { column: 'updated_at', ascending: false },
    });
  }

  async setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry> {
    return this.db.upsert<LibraryEntry>(
      'user_library',
      {
        user_id: userId,
        product_id: dto.product_id,
        status: dto.status,
        source: dto.source ?? 'manual',
        updated_at: new Date().toISOString(),
      },
      'user_id,product_id',
    );
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.db.delete('user_library', { user_id: userId, product_id: productId });
  }

  async update(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void> {
    await this.db.update(
      'user_library',
      { user_id: userId, product_id: productId },
      { ...data, updated_at: new Date().toISOString() },
    );
  }
}
