import { injectable } from 'tsyringe';
import { algoliasearch } from 'algoliasearch';
import type { ISearchProvider } from '../../core/ports/search-provider.port.js';
import type { SearchResult, SearchFilters, SearchHit } from '../../core/use-cases/search/search.types.js';
import { getEnv } from '../../config/env.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('algolia-search-adapter');

@injectable()
export class AlgoliaSearchAdapter implements ISearchProvider {
  private getClient() {
    const env = getEnv();
    if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_SEARCH_KEY) {
      throw new Error('Search is not configured — ALGOLIA_APP_ID and ALGOLIA_SEARCH_KEY are required');
    }
    return algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_SEARCH_KEY);
  }

  async search(
    query: string,
    filters?: SearchFilters,
    page = 0,
    hitsPerPage = 20,
  ): Promise<SearchResult> {
    const client = this.getClient();
    const env = getEnv();
    const indexName = env.ALGOLIA_INDEX_NAME;

    const filterParts: string[] = [];
    if (filters?.category) {
      filterParts.push(`category:"${filters.category}"`);
    }
    if (filters?.platform) {
      filterParts.push(`platform:"${filters.platform}"`);
    }
    if (filters?.priceMin !== undefined) {
      filterParts.push(`price_usd >= ${filters.priceMin}`);
    }
    if (filters?.priceMax !== undefined) {
      filterParts.push(`price_usd <= ${filters.priceMax}`);
    }
    if (filters?.inStock !== undefined) {
      filterParts.push(`in_stock:${filters.inStock}`);
    }

    const filtersString = filterParts.join(' AND ');

    logger.debug('Searching Algolia', { query, filtersString, page, hitsPerPage });

    const response = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query,
        filters: filtersString || undefined,
        page,
        hitsPerPage,
      },
    });

    const hits: SearchHit[] = (response.hits as Record<string, unknown>[]).map((hit) => ({
      objectID: String(hit.objectID ?? ''),
      name: String(hit.name ?? ''),
      slug: String(hit.slug ?? ''),
      image_url: hit.image_url != null ? String(hit.image_url) : undefined,
      price_usd: typeof hit.price_usd === 'number' ? hit.price_usd : undefined,
      platform: hit.platform != null ? String(hit.platform) : undefined,
      category: hit.category != null ? String(hit.category) : undefined,
      in_stock: typeof hit.in_stock === 'boolean' ? hit.in_stock : undefined,
    }));

    return {
      hits,
      nbHits: response.nbHits ?? 0,
      page: response.page ?? page,
      nbPages: response.nbPages ?? 0,
      hitsPerPage: response.hitsPerPage ?? hitsPerPage,
      query: response.query ?? query,
    };
  }
}
