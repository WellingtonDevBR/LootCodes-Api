import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ISessionRepository } from '../../core/ports/session-repository.port.js';
import type { UserSession, UpsertSessionDto } from '../../core/use-cases/profile/profile.types.js';
import { inetColumnOrNull } from '../../shared/client-ip.js';

@injectable()
export class SupabaseSessionRepository implements ISessionRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async upsert(params: UpsertSessionDto): Promise<UserSession> {
    const fingerprint = typeof params.fingerprint_hash === 'string' ? params.fingerprint_hash.trim() : '';
    if (fingerprint.length > 0) {
      /** Fingerprint linkage overload (no merge flags in signature). */
      return this.db.rpc<UserSession>('upsert_user_session', {
        p_user_id: params.user_id ?? null,
        p_session_id: params.session_id,
        p_ip_address: inetColumnOrNull(params.ip_address),
        p_country_code: null,
        p_city: null,
        p_region: null,
        p_user_agent: params.user_agent?.slice(0, 500) ?? null,
        p_fingerprint_hash: fingerprint.slice(0, 128),
      });
    }

    return this.db.rpc<UserSession>('upsert_user_session', {
      p_session_id: params.session_id,
      p_user_id: params.user_id ?? null,
      p_ip_address: inetColumnOrNull(params.ip_address),
      p_country_code: null,
      p_city: null,
      p_region: null,
      p_started_at: null,
      p_user_agent: params.user_agent?.slice(0, 500) ?? null,
      p_merge_anonymous: params.merge_anonymous === true,
      p_auto_consolidate: params.auto_consolidate !== false,
      p_client_channel:
        params.client_channel === 'web' || params.client_channel === 'mobile_app'
          ? params.client_channel
          : null,
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
