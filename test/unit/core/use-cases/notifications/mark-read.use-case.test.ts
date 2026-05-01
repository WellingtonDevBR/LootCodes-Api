import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { MarkReadUseCase } from '../../../../../src/core/use-cases/notifications/mark-read.use-case.js';

describe('MarkReadUseCase', () => {
  let mocks: TestMocks;
  let useCase: MarkReadUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<MarkReadUseCase>(UC_TOKENS.MarkRead);
  });

  it('should mark a notification as read', async () => {
    mocks.notificationRepo.notifications.push({
      id: 'notif-1',
      user_id: 'user-1',
      title: 'Test notification',
      read: false,
    });

    await useCase.execute('user-1', 'notif-1');

    expect(mocks.notificationRepo.notifications[0].read).toBe(true);
  });

  it('should throw ValidationError when notificationId is empty', async () => {
    await expect(useCase.execute('user-1', '')).rejects.toThrow('notificationId is required');
  });

  it('should not throw when notification does not exist', async () => {
    await expect(useCase.execute('user-1', 'non-existent')).resolves.toBeUndefined();
  });
});
