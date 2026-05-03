import type { UserProfile, UpsertProfileDto } from '../use-cases/profile/profile.types.js';

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile>;
  deleteProfile(userId: string): Promise<void>;
  restoreProfile(userId: string): Promise<void>;
  checkDeleted(userId: string): Promise<boolean>;
  getRole(userId: string): Promise<string | null>;
  ensureDefaultRole(userId: string): Promise<void>;
}
