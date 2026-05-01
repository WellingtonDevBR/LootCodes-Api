import type { LibraryEntry, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../services/library/library.types.js';

export interface ILibraryService {
  listLibrary(userId: string): Promise<LibraryEntry[]>;
  setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry>;
  removeFromLibrary(userId: string, productId: string): Promise<void>;
  updateEntry(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void>;
}
