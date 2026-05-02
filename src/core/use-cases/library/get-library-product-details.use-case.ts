import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IUserLibraryRepository } from '../../ports/user-library-repository.port.js';
import type { LibraryProductDetails } from './library.types.js';

@injectable()
export class GetLibraryProductDetailsUseCase {
  constructor(
    @inject(TOKENS.UserLibraryRepository) private libraryRepo: IUserLibraryRepository,
  ) {}

  async execute(productIds: string[]): Promise<LibraryProductDetails[]> {
    return this.libraryRepo.getProductDetails(productIds);
  }
}
