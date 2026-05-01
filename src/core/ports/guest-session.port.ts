export interface GuestSession {
  token: string;
  email: string;
  order_id: string;
  expires_at: string;
}

export interface IGuestSessionRepository {
  validateToken(token: string): Promise<GuestSession | null>;
  exchangeToken(rawToken: string): Promise<GuestSession | null>;
}
