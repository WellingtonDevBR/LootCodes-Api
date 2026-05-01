import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProfileUseCase } from '../../../../../src/core/use-cases/profile/get-profile.use-case.js';
import type { IUserProfileRepository } from '../../../../../src/core/ports/user-profile-repository.port.js';
import { NotFoundError } from '../../../../../src/core/errors/domain-errors.js';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
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
    useCase = new GetProfileUseCase(userProfileRepo as unknown as IUserProfileRepository);
  });

  it('should return profile when found', async () => {
    const profile = { id: 'profile-1', user_id: 'user-1', full_name: 'Test User', country: 'US' };
    userProfileRepo.getProfile.mockResolvedValue(profile);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(profile);
    expect(userProfileRepo.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('should throw NotFoundError when profile is missing', async () => {
    userProfileRepo.getProfile.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('nonexistent')).rejects.toThrow('Profile not found');
  });
});
