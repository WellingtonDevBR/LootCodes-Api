import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ILibraryService } from '../../../../../src/core/ports/library-service.port.js';

describe('LibraryService', () => {
  let mocks: TestMocks;
  let service: ILibraryService;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    service = container.resolve<ILibraryService>(TOKENS.LibraryService);
  });

  describe('listLibrary', () => {
    it('should return empty list initially', async () => {
      const entries = await service.listLibrary('user-1');
      expect(entries).toEqual([]);
    });

    it('should return entries after setting status', async () => {
      await service.setStatus('user-1', { product_id: 'prod-1', status: 'owned' });
      const entries = await service.listLibrary('user-1');
      expect(entries.length).toBe(1);
      expect(entries[0].status).toBe('owned');
    });
  });

  describe('setStatus', () => {
    it('should set status for product', async () => {
      const entry = await service.setStatus('user-1', { product_id: 'prod-1', status: 'playing' });
      expect(entry.product_id).toBe('prod-1');
      expect(entry.status).toBe('playing');
    });

    it('should reject missing product_id', async () => {
      await expect(service.setStatus('user-1', { product_id: '', status: 'owned' })).rejects.toThrow('product_id is required');
    });

    it('should reject missing status', async () => {
      await expect(service.setStatus('user-1', { product_id: 'prod-1', status: '' as 'owned' })).rejects.toThrow('status is required');
    });
  });

  describe('removeFromLibrary', () => {
    it('should remove entry', async () => {
      await service.setStatus('user-1', { product_id: 'prod-1', status: 'owned' });
      await service.removeFromLibrary('user-1', 'prod-1');
      const entries = await service.listLibrary('user-1');
      expect(entries.length).toBe(0);
    });
  });

  describe('updateEntry', () => {
    it('should update hours and rating', async () => {
      await service.setStatus('user-1', { product_id: 'prod-1', status: 'playing' });
      await expect(service.updateEntry('user-1', 'prod-1', { hours_played: 10, user_rating: 8 })).resolves.not.toThrow();
    });

    it('should reject negative hours', async () => {
      await expect(service.updateEntry('user-1', 'prod-1', { hours_played: -5 })).rejects.toThrow('cannot be negative');
    });

    it('should reject rating out of range', async () => {
      await expect(service.updateEntry('user-1', 'prod-1', { user_rating: 15 })).rejects.toThrow('between 0 and 10');
    });
  });
});
