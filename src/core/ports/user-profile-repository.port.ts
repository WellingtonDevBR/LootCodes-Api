import type { UserProfile, UpsertProfileDto } from '../services/profile/profile.types.js';

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile>;
  deleteProfile(userId: string): Promise<void>;
  checkDeleted(userId: string): Promise<boolean>;
  getRole(userId: string): Promise<string | null>;
}
