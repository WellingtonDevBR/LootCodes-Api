import type {
  UserProfile,
  UpsertProfileDto,
  ChangeEmailDto,
  ChangePasswordDto,
  UserSession,
  UpsertSessionDto,
} from '../services/profile/profile.types.js';

export interface IProfileService {
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile>;
  deleteAccount(userId: string): Promise<void>;
  changeEmail(userId: string, dto: ChangeEmailDto): Promise<void>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  getRole(userId: string): Promise<string>;
  upsertSession(dto: UpsertSessionDto): Promise<UserSession>;
  getActiveSessions(userId: string): Promise<UserSession[]>;
  terminateSession(sessionId: string): Promise<void>;
}
