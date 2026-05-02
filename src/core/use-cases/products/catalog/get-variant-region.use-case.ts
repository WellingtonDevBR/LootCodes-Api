import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../di/tokens.js';
import type { IDatabase } from '../../../ports/database.port.js';

export interface VariantRegionResult {
  id: string;
  region_id: string;
  region: {
    id: string;
    name: string;
    code: string;
    is_global: boolean;
  } | null;
}

@injectable()
export class GetVariantRegionUseCase {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async execute(variantId: string): Promise<VariantRegionResult | null> {
    return this.db.queryOne<VariantRegionResult>('product_variants', {
      select: 'id, region_id, region:product_regions(id, name, code, is_global)',
      eq: [['id', variantId]],
    });
  }
}
