import type { UserSession, UpsertSessionDto } from '../use-cases/profile/profile.types.js';

export interface ISessionRepository {
  upsert(params: UpsertSessionDto): Promise<UserSession>;
  getActiveSessions(userId: string, limit?: number): Promise<UserSession[]>;
  terminate(sessionId: string): Promise<void>;
}
