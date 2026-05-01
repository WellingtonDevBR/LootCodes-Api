import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISessionRepository } from '../../ports/session-repository.port.js';
import type { UserSession, UpsertSessionDto } from './profile.types.js';

@injectable()
export class UpsertSessionUseCase {
  constructor(
    @inject(TOKENS.SessionRepository) private sessionRepo: ISessionRepository,
  ) {}

  async execute(dto: UpsertSessionDto): Promise<UserSession> {
    return this.sessionRepo.upsert(dto);
  }
}
