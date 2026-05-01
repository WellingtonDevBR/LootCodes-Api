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
