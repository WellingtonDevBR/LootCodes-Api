import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { Genre } from '../product.types.js';

@injectable()
export class GetGenresUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(): Promise<Genre[]> {
    return this.referenceRepo.getGenres();
  }
}
