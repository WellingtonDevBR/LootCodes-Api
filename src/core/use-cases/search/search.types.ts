export interface SearchFilters {
  category?: string;
  platform?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  [key: string]: unknown;
}

export interface SearchHit {
  objectID: string;
  name: string;
  slug: string;
  image_url?: string;
  price_usd?: number;
  platform?: string;
  category?: string;
  in_stock?: boolean;
}

export interface SearchResult {
  hits: SearchHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  query: string;
}
