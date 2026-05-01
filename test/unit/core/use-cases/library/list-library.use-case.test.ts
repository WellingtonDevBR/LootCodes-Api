import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { ListLibraryUseCase } from '../../../../../src/core/use-cases/library/list-library.use-case.js';
import type { LibraryEntry } from '../../../../../src/core/use-cases/library/library.types.js';

describe('ListLibraryUseCase', () => {
  let mocks: TestMocks;
  let useCase: ListLibraryUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<ListLibraryUseCase>(UC_TOKENS.ListLibrary);
  });

  it('should return empty list when no entries', async () => {
    const entries = await useCase.execute('user-1');
    expect(entries).toEqual([]);
  });

  it('should return entries for the given user', async () => {
    const entry: LibraryEntry = {
      id: 'lib-1',
      user_id: 'user-1',
      product_id: 'prod-1',
      status: 'owned',
      source: 'purchase',
      created_at: new Date().toISOString(),
    };
    mocks.libraryRepo.entries.push(entry);

    const entries = await useCase.execute('user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].product_id).toBe('prod-1');
  });

  it('should not return entries for a different user', async () => {
    const entry: LibraryEntry = {
      id: 'lib-1',
      user_id: 'user-1',
      product_id: 'prod-1',
      status: 'owned',
      source: 'purchase',
    };
    mocks.libraryRepo.entries.push(entry);

    const entries = await useCase.execute('user-2');
    expect(entries).toEqual([]);
  });

  it('should return multiple entries', async () => {
    mocks.libraryRepo.entries.push(
      { id: 'lib-1', user_id: 'user-1', product_id: 'prod-1', status: 'owned', source: 'purchase' },
      { id: 'lib-2', user_id: 'user-1', product_id: 'prod-2', status: 'playing', source: 'manual' },
    );

    const entries = await useCase.execute('user-1');
    expect(entries).toHaveLength(2);
  });
});
