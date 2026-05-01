import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IGuestSessionRepository, GuestSession } from '../../core/ports/guest-session.port.js';

@injectable()
export class SupabaseGuestSessionRepository implements IGuestSessionRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async validateToken(token: string): Promise<GuestSession | null> {
    return this.db.rpc<GuestSession | null>('validate_guest_session_token', {
      p_token: token,
    });
  }

  async exchangeToken(rawToken: string): Promise<GuestSession | null> {
    return this.db.rpc<GuestSession | null>('exchange_guest_token', {
      p_raw_token: rawToken,
    });
  }
}
