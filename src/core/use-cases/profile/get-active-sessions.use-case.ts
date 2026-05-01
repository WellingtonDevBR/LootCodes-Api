import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISessionRepository } from '../../ports/session-repository.port.js';
import type { UserSession } from './profile.types.js';

@injectable()
export class GetActiveSessionsUseCase {
  constructor(
    @inject(TOKENS.SessionRepository) private sessionRepo: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<UserSession[]> {
    return this.sessionRepo.getActiveSessions(userId);
  }
}
