import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IPushTokenRepository } from '../../core/ports/push-token-repository.port.js';

@injectable()
export class SupabasePushTokenRepository implements IPushTokenRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async register(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
    await this.db.upsert(
      'push_tokens',
      {
        user_id: userId,
        token,
        platform,
        client_channel: platform === 'web' ? 'web' : 'mobile_app',
        updated_at: new Date().toISOString(),
      },
      'user_id,token',
    );
  }

  async remove(userId: string, token: string): Promise<void> {
    await this.db.delete('push_tokens', { user_id: userId, token });
  }
}
