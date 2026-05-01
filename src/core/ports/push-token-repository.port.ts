export interface IPushTokenRepository {
  register(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void>;
  remove(userId: string, token: string): Promise<void>;
}
