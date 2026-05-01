import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserProfileRepository } from '../../ports/user-profile-repository.port.js';

@injectable()
export class GetRoleUseCase {
  constructor(
    @inject(TOKENS.UserProfileRepository) private userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<string> {
    const role = await this.userProfileRepo.getRole(userId);
    return role ?? 'user';
  }
}
