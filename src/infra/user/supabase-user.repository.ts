import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserRepository } from '../../core/ports/user-repository.port.js';

@injectable()
export class SupabaseUserRepository implements IUserRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async findIdByEmail(email: string): Promise<string | null> {
    return this.db.rpc<string | null>('get_auth_user_id_by_email', {
      p_email: email,
    });
  }
}
