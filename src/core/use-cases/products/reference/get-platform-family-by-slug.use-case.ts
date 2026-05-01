import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IReferenceDataRepository } from '../../../ports/reference-data-repository.port.js';
import type { PlatformFamily } from '../product.types.js';
import { NotFoundError } from '../../../errors/domain-errors.js';

@injectable()
export class GetPlatformFamilyBySlugUseCase {
  constructor(
    @inject(TOKENS.ReferenceDataRepository) private referenceRepo: IReferenceDataRepository,
  ) {}

  async execute(slug: string): Promise<PlatformFamily> {
    const family = await this.referenceRepo.findPlatformFamilyBySlug(slug);
    if (!family) {
      throw new NotFoundError(`Platform family not found: ${slug}`);
    }
    return family;
  }
}
