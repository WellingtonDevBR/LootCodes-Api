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

// ── Storefront product page response (sanitized for client) ─────────

export interface StorefrontProductTranslation {
  language_code: string;
  name?: string;
  description?: string;
  short_description?: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
}

export interface StorefrontVariantTranslation {
  language_code: string;
  activation_instructions?: string;
  system_requirements?: unknown;
}

export interface StorefrontVariantPlatform {
  id: string;
  code: string;
  name: string;
  slug: string;
  icon_url?: string;
  family_code?: string;
}

export interface StorefrontVariantRegion {
  id: string;
  code: string;
  name: string;
  is_global?: boolean;
}

export interface StorefrontVariant {
  id: string;
  slug?: string;
  product_id: string;
  region_id: string;
  price_usd: number;
  retail_price_usd?: number;
  face_value?: string;
  is_active: boolean;
  purchasable: boolean;
  release_date?: string | null;
  activation_instructions?: string;
  system_requirements?: unknown;
  image_url?: string | null;
  languages?: unknown[];
  platforms: StorefrontVariantPlatform[];
  region?: StorefrontVariantRegion;
  variant_translations?: StorefrontVariantTranslation[];
  created_at?: string;
  updated_at?: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  seo_title?: string;
  seo_description?: string;
  product_type?: string;
  category?: string;
  developer?: string;
  publisher?: string;
  rating?: string | null;
  tags?: string[];
  featured?: boolean;
  image_url?: string | null;
  cover_image_url?: string | null;
  release_date?: string | null;
  is_active?: boolean;
  delivery_type?: string;
  expected_delivery_date?: string | null;
  preorder_delivery_info?: string | null;
  preorder_start_date?: string | null;
  preorder_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  currency?: string;
  price_usd?: number;
  discount_percentage?: number;
  availability_status?: string;
  review_count?: number;
  customer_rating?: number | null;
  metacritic_score?: number | null;
  product_translations?: StorefrontProductTranslation[];
  product_genres?: { genres: { name: string } }[];
}

export interface StorefrontGalleryItem {
  id: string;
  url: string;
  image_type: string;
  display_order: number;
  thumbnail_url?: string;
  alt_text?: string;
}

/** Sanitized product page response — no key counts, no internal flags. */
export interface StorefrontProductPageData {
  product: StorefrontProduct;
  variants: StorefrontVariant[];
  gallery: StorefrontGalleryItem[];
  stock_status: Record<string, boolean>;
  matchedVariantId?: string | null;
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
  slug: string;
  sort_order: number;
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

export interface CardVariantRow {
  product_id: string;
  variant_id: string;
  price_usd: number;
  retail_price_usd: number | null;
  release_date: string | null;
  platform_name: string | null;
  platform_code: string | null;
  region_name: string | null;
  region_code: string | null;
  in_stock: boolean;
  face_value: string | null;
  product_type: string | null;
}
