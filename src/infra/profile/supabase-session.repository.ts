import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ISessionRepository } from '../../core/ports/session-repository.port.js';
import type { UserSession, UpsertSessionDto } from '../../core/services/profile/profile.types.js';

@injectable()
export class SupabaseSessionRepository implements ISessionRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async upsert(params: UpsertSessionDto): Promise<UserSession> {
    return this.db.rpc<UserSession>('upsert_user_session', {
      p_session_id: params.session_id,
      p_user_id: params.user_id,
      p_ip_address: params.ip_address,
      p_user_agent: params.user_agent,
      p_client_channel: params.client_channel,
      p_fingerprint_hash: params.fingerprint_hash,
      p_merge_anonymous: params.merge_anonymous ?? false,
    });
  }

  async getActiveSessions(userId: string, limit?: number): Promise<UserSession[]> {
    return this.db.rpc<UserSession[]>('get_user_active_sessions', {
      p_user_id: userId,
      p_limit: limit ?? 20,
    });
  }

  async terminate(sessionId: string): Promise<void> {
    await this.db.update('user_sessions', { id: sessionId }, { ended_at: new Date().toISOString() });
  }
}
