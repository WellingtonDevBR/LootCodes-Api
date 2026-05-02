import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IUserRepository } from '../../core/ports/user-repository.port.js';

function parseGetAuthUserIdByEmailResult(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === 'string') return data.trim() || null;
  if (Array.isArray(data) && data.length > 0) {
    const row = data[0] as { id?: unknown };
    if (typeof row?.id === 'string' && row.id.length > 0) return row.id;
  }
  if (typeof data === 'object' && data !== null && 'id' in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  return null;
}

@injectable()
export class SupabaseUserRepository implements IUserRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async findIdByEmail(email: string): Promise<string | null> {
    const data = await this.db.rpc<unknown>('get_auth_user_id_by_email', {
      p_email: email,
    });
    return parseGetAuthUserIdByEmailResult(data);
  }
}
