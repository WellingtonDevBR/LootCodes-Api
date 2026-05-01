import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import type { LibraryEntry, SetLibraryStatusDto } from './library.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('set-library-status');

@injectable()
export class SetLibraryStatusUseCase {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async execute(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry> {
    if (!dto.product_id) {
      throw new ValidationError('product_id is required');
    }
    if (!dto.status) {
      throw new ValidationError('status is required');
    }

    logger.info('Setting library status', { userId, productId: dto.product_id, status: dto.status });
    return this.libraryRepo.setStatus(userId, dto);
  }
}
