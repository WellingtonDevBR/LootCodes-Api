import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { Platform } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';

@injectable()
export class GetPlatformBySlugUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(slug: string): Promise<Platform> {
    const platform = await this.referenceRepo.findPlatformBySlug(slug);
    if (!platform) {
      throw new NotFoundError(`Platform not found: ${slug}`);
    }
    return platform;
  }
}
