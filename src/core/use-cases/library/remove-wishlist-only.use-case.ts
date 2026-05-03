import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('remove-wishlist-only');

@injectable()
export class RemoveWishlistOnlyUseCase {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async execute(userId: string, productId: string): Promise<void> {
    if (!productId) {
      throw new ValidationError('productId is required');
    }

    logger.info('Removing wishlist entry only', { userId, productId });
    await this.libraryRepo.removeWishlistOnly(userId, productId);
  }
}
