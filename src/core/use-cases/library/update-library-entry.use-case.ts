import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import type { UpdateLibraryEntryDto } from './library.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('update-library-entry');

@injectable()
export class UpdateLibraryEntryUseCase {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async execute(userId: string, productId: string, data: UpdateLibraryEntryDto): Promise<void> {
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
