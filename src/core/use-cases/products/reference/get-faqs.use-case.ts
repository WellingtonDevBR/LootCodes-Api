import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { FAQ } from '../product.types.js';

@injectable()
export class GetFaqsUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(): Promise<FAQ[]> {
    return this.referenceRepo.getFAQs();
  }
}
