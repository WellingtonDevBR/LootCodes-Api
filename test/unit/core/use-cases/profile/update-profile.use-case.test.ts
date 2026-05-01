import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateProfileUseCase } from '../../../../../src/core/use-cases/profile/update-profile.use-case.js';
import type { IUserProfileRepository } from '../../../../../src/core/ports/user-profile-repository.port.js';
import { ValidationError } from '../../../../../src/core/errors/domain-errors.js';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
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
    useCase = new UpdateProfileUseCase(userProfileRepo as unknown as IUserProfileRepository);
  });

  it('should validate and update profile', async () => {
    const updated = { id: 'p1', user_id: 'user-1', full_name: 'New Name', country: 'BR' };
    userProfileRepo.upsertProfile.mockResolvedValue(updated);

    const result = await useCase.execute('user-1', { full_name: 'New Name', country: 'BR' });

    expect(result).toEqual(updated);
    expect(userProfileRepo.upsertProfile).toHaveBeenCalledWith('user-1', { full_name: 'New Name', country: 'BR' });
  });

  it('should reject a name that is too short', async () => {
    await expect(useCase.execute('user-1', { full_name: 'A' })).rejects.toThrow(ValidationError);
  });

  it('should reject an invalid country code', async () => {
    await expect(useCase.execute('user-1', { country: 'INVALID' })).rejects.toThrow(ValidationError);
  });

  it('should allow update with only country', async () => {
    const updated = { id: 'p1', user_id: 'user-1', country: 'US' };
    userProfileRepo.upsertProfile.mockResolvedValue(updated);

    const result = await useCase.execute('user-1', { country: 'US' });

    expect(result.country).toBe('US');
  });
});
