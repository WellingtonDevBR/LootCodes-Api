import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository, PlatformNavItemGrouped } from '../../../ports/reference-data-repository.port.js';

@injectable()
export class GetPlatformNavItemsUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(): Promise<PlatformNavItemGrouped[]> {
    return this.referenceRepo.getPlatformNavItemsWithVariants();
  }
}
