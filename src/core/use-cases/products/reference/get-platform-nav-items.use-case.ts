import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { PlatformNavItem } from '../product.types.js';

@injectable()
export class GetPlatformNavItemsUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(): Promise<PlatformNavItem[]> {
    return this.referenceRepo.getPlatformNavItems();
  }
}
