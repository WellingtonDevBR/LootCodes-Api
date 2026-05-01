import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { Platform } from '../product.types.js';

@injectable()
export class GetPlatformsUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(): Promise<Platform[]> {
    return this.referenceRepo.getPlatforms();
  }
}
