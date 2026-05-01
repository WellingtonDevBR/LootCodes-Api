import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RestoreAccountUseCase } from '../../../../../src/core/use-cases/profile/restore-account.use-case.js';
import type { IUserProfileRepository } from '../../../../../src/core/ports/user-profile-repository.port.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('RestoreAccountUseCase', () => {
  let useCase: RestoreAccountUseCase;
  let userProfileRepo: {
    getProfile: ReturnType<typeof vi.fn>;
    upsertProfile: ReturnType<typeof vi.fn>;
    deleteProfile: ReturnType<typeof vi.fn>;
    restoreProfile: ReturnType<typeof vi.fn>;
    checkDeleted: ReturnType<typeof vi.fn>;
    getRole: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    userProfileRepo = {
      getProfile: vi.fn(),
      upsertProfile: vi.fn(),
      deleteProfile: vi.fn(),
      restoreProfile: vi.fn(),
      checkDeleted: vi.fn(),
      getRole: vi.fn(),
    };
    useCase = new RestoreAccountUseCase(userProfileRepo as unknown as IUserProfileRepository);
  });

  it('should restore a deleted account', async () => {
    userProfileRepo.checkDeleted.mockResolvedValue(true);
    userProfileRepo.restoreProfile.mockResolvedValue(undefined);

    await useCase.execute('deleted-user');

    expect(userProfileRepo.checkDeleted).toHaveBeenCalledWith('deleted-user');
    expect(userProfileRepo.restoreProfile).toHaveBeenCalledWith('deleted-user');
  });

  it('should throw ValidationError if account is not deleted', async () => {
    userProfileRepo.checkDeleted.mockResolvedValue(false);

    await expect(useCase.execute('active-user')).rejects.toThrow(ValidationError);
    await expect(useCase.execute('active-user')).rejects.toThrow('Account is not deleted');
  });
});
