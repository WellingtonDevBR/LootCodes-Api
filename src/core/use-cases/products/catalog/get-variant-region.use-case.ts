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
    const rows = await this.db.query<{
      id: string;
      region_id: string;
      region_row_id: string | null;
      region_name: string | null;
      region_code: string | null;
      region_is_global: boolean | null;
    }>(
      `SELECT pv.id, pv.region_id,
              pr.id AS region_row_id, pr.name AS region_name, pr.code AS region_code, pr.is_global AS region_is_global
       FROM product_variants pv
       LEFT JOIN product_regions pr ON pr.id = pv.region_id
       WHERE pv.id = $1
       LIMIT 1`,
      [variantId],
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      region_id: row.region_id,
      region: row.region_row_id
        ? { id: row.region_row_id, name: row.region_name!, code: row.region_code!, is_global: row.region_is_global! }
        : null,
    };
  }
}
