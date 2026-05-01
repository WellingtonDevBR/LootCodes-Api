import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteAccountUseCase } from '../../../../../src/core/use-cases/profile/delete-account.use-case.js';
import type { IUserProfileRepository } from '../../../../../src/core/ports/user-profile-repository.port.js';

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
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
    useCase = new DeleteAccountUseCase(userProfileRepo as unknown as IUserProfileRepository);
  });

  it('should delete the account', async () => {
    userProfileRepo.deleteProfile.mockResolvedValue(undefined);

    await useCase.execute('user-1');

    expect(userProfileRepo.deleteProfile).toHaveBeenCalledWith('user-1');
  });

  it('should propagate repository errors', async () => {
    userProfileRepo.deleteProfile.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('user-1')).rejects.toThrow('DB error');
  });
});
