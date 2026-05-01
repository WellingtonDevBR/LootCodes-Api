import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { INotificationService } from '../../../../../src/core/ports/notification-service.port.js';

describe('NotificationService', () => {
  let mocks: TestMocks;
  let service: INotificationService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<INotificationService>(TOKENS.NotificationService);
  });

  describe('listNotifications', () => {
    it('should return empty list initially', async () => {
      const notifications = await service.listNotifications('user-1');
      expect(notifications).toEqual([]);
    });

    it('should return notifications for user', async () => {
      mocks.notificationRepo.notifications.push(
        { id: 'n1', user_id: 'user-1', title: 'Hello', read: false },
        { id: 'n2', user_id: 'user-2', title: 'Not mine', read: false },
      );
      const notifications = await service.listNotifications('user-1');
      expect(notifications.length).toBe(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mocks.notificationRepo.notifications.push(
        { id: 'n1', user_id: 'user-1', title: 'Unread', read: false },
        { id: 'n2', user_id: 'user-1', title: 'Read', read: true },
      );
      const count = await service.getUnreadCount('user-1');
      expect(count).toBe(1);
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      mocks.notificationRepo.notifications.push({ id: 'n1', user_id: 'user-1', title: 'Test', read: false });
      await service.markRead('user-1', 'n1');
      const count = await service.getUnreadCount('user-1');
      expect(count).toBe(0);
    });
  });

  describe('markAllRead', () => {
    it('should mark all as read', async () => {
      mocks.notificationRepo.notifications.push(
        { id: 'n1', user_id: 'user-1', title: 'A', read: false },
        { id: 'n2', user_id: 'user-1', title: 'B', read: false },
      );
      await service.markAllRead('user-1');
      const count = await service.getUnreadCount('user-1');
      expect(count).toBe(0);
    });
  });

  describe('preferences', () => {
    it('should return defaults when no preferences set', async () => {
      const prefs = await service.getPreferences('user-1');
      expect(prefs.orders).toBe(true);
      expect(prefs.promotions).toBe(true);
    });

    it('should update preferences', async () => {
      const updated = await service.updatePreferences('user-1', { promotions: false });
      expect(updated.promotions).toBe(false);
    });
  });

  describe('push tokens', () => {
    it('should register push token', async () => {
      await expect(service.registerPushToken('user-1', 'fcm-token', 'web')).resolves.not.toThrow();
      expect(mocks.pushTokenRepo.tokens.length).toBe(1);
    });

    it('should reject empty token', async () => {
      await expect(service.registerPushToken('user-1', '', 'web')).rejects.toThrow('token is required');
    });

    it('should remove push token', async () => {
      await service.registerPushToken('user-1', 'fcm-token', 'web');
      await service.removePushToken('user-1', 'fcm-token');
      expect(mocks.pushTokenRepo.tokens.length).toBe(0);
    });
  });
});
