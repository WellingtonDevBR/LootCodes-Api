import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ISearchProvider } from '../../ports/search-provider.port.js';
import type { SearchResult, SearchFilters } from './search.types.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('search-use-case');

@injectable()
export class SearchUseCase {
  constructor(
    @inject(TOKENS.SearchProvider) private searchProvider: ISearchProvider,
  ) {}

  async execute(
    query: string,
    filters?: SearchFilters,
    page = 0,
    hitsPerPage = 20,
  ): Promise<SearchResult> {
    logger.debug('Executing search', { query, page, hitsPerPage });
    return this.searchProvider.search(query, filters, page, hitsPerPage);
  }
}
