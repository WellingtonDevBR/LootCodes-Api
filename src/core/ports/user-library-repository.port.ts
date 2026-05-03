import type { LibraryEntry, LibraryProductDetails, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../use-cases/library/library.types.js';

export interface IUserLibraryRepository {
  list(userId: string): Promise<LibraryEntry[]>;
  setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry>;
  remove(userId: string, productId: string): Promise<void>;
  /** Deletes the row only when status is wishlist (matches legacy wishlist-only delete). */
  removeWishlistOnly(userId: string, productId: string): Promise<void>;
  update(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void>;
  getProductDetails(productIds: string[]): Promise<LibraryProductDetails[]>;
}
