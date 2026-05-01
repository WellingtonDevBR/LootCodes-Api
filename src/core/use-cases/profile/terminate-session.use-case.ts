import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISessionRepository } from '../../ports/session-repository.port.js';

@injectable()
export class TerminateSessionUseCase {
  constructor(
    @inject(TOKENS.SessionRepository) private sessionRepo: ISessionRepository,
  ) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionRepo.terminate(sessionId);
  }
}
