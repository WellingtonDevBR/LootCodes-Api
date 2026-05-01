import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { IProfileService } from '../../../../../src/core/ports/profile-service.port.js';

describe('ProfileService', () => {
  let mocks: TestMocks;
  let service: IProfileService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<IProfileService>(TOKENS.ProfileService);
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      mocks.userProfileRepo.setProfile('user-1', {
        id: 'profile-1', user_id: 'user-1', full_name: 'Test User', country: 'US',
      });
      const profile = await service.getProfile('user-1');
      expect(profile.user_id).toBe('user-1');
      expect(profile.full_name).toBe('Test User');
    });

    it('should throw NotFoundError when profile missing', async () => {
      await expect(service.getProfile('nonexistent')).rejects.toThrow('Profile not found');
    });
  });

  describe('updateProfile', () => {
    it('should validate and update profile', async () => {
      const profile = await service.updateProfile('user-1', { full_name: 'New Name', country: 'BR' });
      expect(profile.full_name).toBe('New Name');
    });

    it('should reject invalid name', async () => {
      await expect(service.updateProfile('user-1', { full_name: 'A' })).rejects.toThrow();
    });
  });

  describe('deleteAccount', () => {
    it('should delete profile', async () => {
      mocks.userProfileRepo.setProfile('user-1', { id: 'p1', user_id: 'user-1' });
      await service.deleteAccount('user-1');
      await expect(service.getProfile('user-1')).rejects.toThrow('Profile not found');
    });
  });

  describe('changeEmail', () => {
    it('should validate and change email', async () => {
      mocks.auth.addUser('old@example.com', 'pass', { id: 'user-1', email: 'old@example.com' });
      await expect(service.changeEmail('user-1', { new_email: 'new@example.com', password: 'pass' })).resolves.not.toThrow();
    });

    it('should reject invalid email', async () => {
      await expect(service.changeEmail('user-1', { new_email: 'not-an-email', password: 'pass' })).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      mocks.auth.addUser('test@example.com', 'old', { id: 'user-1', email: 'test@example.com' });
      await expect(service.changePassword('user-1', { current_password: 'old', new_password: 'newpass123' })).resolves.not.toThrow();
    });

    it('should reject short password', async () => {
      await expect(service.changePassword('user-1', { current_password: 'old', new_password: '12' })).rejects.toThrow();
    });
  });

  describe('getRole', () => {
    it('should return user role', async () => {
      const role = await service.getRole('user-1');
      expect(role).toBe('user');
    });
  });

  describe('sessions', () => {
    it('should upsert session', async () => {
      const session = await service.upsertSession({ session_id: 'sess-1', user_id: 'user-1', client_channel: 'web' });
      expect(session.id).toBe('sess-1');
    });

    it('should get active sessions', async () => {
      await service.upsertSession({ session_id: 'sess-1', user_id: 'user-1' });
      const sessions = await service.getActiveSessions('user-1');
      expect(sessions.length).toBe(1);
    });

    it('should terminate session', async () => {
      await service.upsertSession({ session_id: 'sess-1', user_id: 'user-1' });
      await service.terminateSession('sess-1');
      const sessions = await service.getActiveSessions('user-1');
      expect(sessions.length).toBe(0);
    });
  });
});
