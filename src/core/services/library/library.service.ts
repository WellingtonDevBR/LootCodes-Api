import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import type { ILibraryService } from '../../ports/library-service.port.js';
import type { LibraryEntry, SetLibraryStatusDto, UpdateLibraryEntryDto } from './library.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('library-service');

@injectable()
export class LibraryService implements ILibraryService {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async listLibrary(userId: string): Promise<LibraryEntry[]> {
    return this.libraryRepo.list(userId);
  }

  async setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry> {
    if (!dto.product_id) {
      throw new ValidationError('product_id is required');
    }
    if (!dto.status) {
      throw new ValidationError('status is required');
    }

    logger.info('Setting library status', { userId, productId: dto.product_id, status: dto.status });
    return this.libraryRepo.setStatus(userId, dto);
  }

  async removeFromLibrary(userId: string, productId: string): Promise<void> {
    if (!productId) {
      throw new ValidationError('productId is required');
    }

    logger.info('Removing from library', { userId, productId });
    await this.libraryRepo.remove(userId, productId);
  }

  async updateEntry(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void> {
    if (!productId) {
      throw new ValidationError('productId is required');
    }

    if (data.user_rating !== undefined && (data.user_rating < 0 || data.user_rating > 10)) {
      throw new ValidationError('user_rating must be between 0 and 10');
    }

    if (data.hours_played !== undefined && data.hours_played < 0) {
      throw new ValidationError('hours_played cannot be negative');
    }

    logger.info('Updating library entry', { userId, productId });
    await this.libraryRepo.update(userId, productId, data);
  }
}
