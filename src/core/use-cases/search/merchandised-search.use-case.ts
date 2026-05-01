import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISearchProvider } from '../../ports/search-provider.port.js';
import type { SearchResult, SearchFilters } from './search.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('merchandised-search-use-case');

@injectable()
export class MerchandisedSearchUseCase {
  constructor(
    @inject(TOKENS.SearchProvider) private searchProvider: ISearchProvider,
  ) {}

  async execute(params: { query: string; category?: string; limit: number }): Promise<SearchResult> {
    logger.debug('Executing merchandised search', params);
    if (this.searchProvider.merchandisedSearch) {
      return this.searchProvider.merchandisedSearch(params);
    }
    const filters: SearchFilters = {};
    if (params.category) filters.category = params.category;
    return this.searchProvider.search(params.query, filters, 0, params.limit);
  }
}
