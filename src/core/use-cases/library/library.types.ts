export type LibraryStatus = 'owned' | 'playing' | 'completed' | 'backlog' | 'wishlist';
export type LibrarySource = 'manual' | 'purchase' | 'gift' | 'import';

export interface LibraryEntry {
  id: string;
  user_id: string;
  product_id: string;
  status: LibraryStatus;
  source: LibrarySource;
  hours_played?: number;
  user_rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SetLibraryStatusDto {
  product_id: string;
  status: LibraryStatus;
  source?: LibrarySource;
}

export interface UpdateLibraryEntryDto {
  hours_played?: number;
  user_rating?: number;
  notes?: string;
}

export interface LibraryProductDetails {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  /** Convenience: first variant face_value, kept on product for legacy storefront usage. */
  face_value?: string | null;
  /** Convenience: true if any variant is purchasable. */
  in_stock?: boolean | null;
  release_date?: string | null;
  product_variants?: Array<{
    id: string;
    price_usd: number;
    retail_price_usd?: number | null;
    face_value?: string | null;
    in_stock?: boolean;
    product_platforms: { name: string; code: string } | null;
    product_regions: { name: string; code: string } | null;
  }>;
}
