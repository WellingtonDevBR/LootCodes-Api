import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserProfileRepository } from '../../core/ports/user-profile-repository.port.js';
import type { UserProfile, UpsertProfileDto } from '../../core/use-cases/profile/profile.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-user-profile-repo');

@injectable()
export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.db.queryOne<UserProfile>('profiles', {
      eq: [['user_id', userId]],
    });
  }

  async upsertProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile> {
    return this.db.upsert<UserProfile>(
      'profiles',
      { user_id: userId, ...data, updated_at: new Date().toISOString() },
      'user_id',
    );
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.db.update('profiles', { user_id: userId }, { deleted_at: new Date().toISOString() });
    logger.info('Profile soft-deleted', { userId });
  }

  async restoreProfile(userId: string): Promise<void> {
    await this.db.update('profiles', { user_id: userId }, { deleted_at: null });
    logger.info('Profile restored', { userId });
  }

  async checkDeleted(userId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ deleted_at: string | null }>('profiles', {
      eq: [['user_id', userId]],
      select: 'deleted_at',
    });
    return row?.deleted_at !== null && row?.deleted_at !== undefined;
  }

  async getRole(userId: string): Promise<string | null> {
    return this.db.rpc<string | null>('get_user_role', { p_user_id: userId });
  }
}
