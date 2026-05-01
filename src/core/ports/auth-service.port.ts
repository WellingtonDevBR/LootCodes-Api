import type { AuthRequestDto, AuthContext, AuthResult } from '../services/auth/auth.types.js';

export interface IAuthService {
  handleAuth(dto: AuthRequestDto, ctx: AuthContext): Promise<AuthResult>;
}
