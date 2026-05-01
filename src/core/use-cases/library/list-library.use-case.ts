import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import type { LibraryEntry } from './library.types.js';

@injectable()
export class ListLibraryUseCase {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async execute(userId: string): Promise<LibraryEntry[]> {
    return this.libraryRepo.list(userId);
  }
}
