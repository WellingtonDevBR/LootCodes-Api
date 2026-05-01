import type { SearchResult, SearchFilters } from '../use-cases/search/search.types.js';

export interface ISearchProvider {
  search(query: string, filters?: SearchFilters, page?: number, hitsPerPage?: number): Promise<SearchResult>;
  merchandisedSearch?(params: { query: string; category?: string; limit: number }): Promise<SearchResult>;
}
