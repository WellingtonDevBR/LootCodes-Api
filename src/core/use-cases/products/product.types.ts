export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  status: string;
  release_date?: string;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  price_usd: number;
  retail_price_usd?: number;
  platform_id?: string;
  region_id?: string;
  edition?: string;
  purchasable?: boolean;
}

export interface ProductPageData {
  product: Product;
  variants: ProductVariant[];
}

export interface Platform {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  icon_url?: string;
}

export interface Region {
  id: string;
  name: string;
  code?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail_url?: string;
  sort_order?: number;
}

export interface StockCheckItem {
  variant_id: string;
  quantity: number;
}

export interface StockCheckResult {
  variant_id: string;
  available: boolean;
  available_quantity: number;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  price_usd?: number;
  retail_price_usd?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category_id?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface LocalizedPrice {
  price_cents: number;
  currency: string;
  auto_generated?: boolean;
  exchange_rate_used?: number;
}

export interface ExcludedCountry {
  country_name: string;
}

export interface RestrictedVariant {
  variant_id: string;
  region_name: string;
  excluded_countries: string[];
}

export interface RestrictedRegion {
  region_id: string;
  region_name: string;
  is_restricted: boolean;
  excluded_countries: string[];
}

export interface GeoRestrictionResult {
  allowed: boolean;
}

export interface PlatformNavItem {
  id: string;
  name: string;
  slug: string;
  code?: string;
  icon_url?: string;
  family?: { id: string; name: string; slug: string; code: string };
}

export interface PlatformFamily {
  id: string;
  name: string;
  slug: string;
  code: string;
  icon_url?: string;
  display_order?: number;
  platforms: Platform[];
}

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  score?: number;
  reason?: string;
}

export interface PopularProduct {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  view_count?: number;
  unique_viewers?: number;
}

export interface RecommendationsBatch {
  similar: RecommendedProduct[];
  also_viewed: RecommendedProduct[];
  bought_together: RecommendedProduct[];
}
