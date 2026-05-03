import { injectable } from 'tsyringe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IStorageProvider } from '../../core/ports/storage-provider.port.js';
import { getEnv } from '../../config/env.js';

@injectable()
export class SupabaseStorageAdapter implements IStorageProvider {
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (this.client) return this.client;
    const env = getEnv();
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    return this.client;
  }

  async createSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string> {
    const { data, error } = await this.getClient()
      .storage.from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return '';
    }

    return data.signedUrl;
  }
}
