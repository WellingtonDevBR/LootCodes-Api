export interface HomepageRecommendation {
  product_id: string;
  product_name: string;
  slug: string;
  image_url: string | null;
  relevance_score: number;
  reason: string;
}

export interface ProductCardVariant {
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

export interface PurchaseRewardConfig {
  enabled: boolean;
  ttl_days: number;
  max_cents: number;
  flat_cents: number;
  percent_bps: number;
  min_subtotal_cents: number;
}

export interface HomepageData {
  recommendations: HomepageRecommendation[];
  variants: ProductCardVariant[];
  purchaseRewardConfig: PurchaseRewardConfig;
  userLibraryProductIds: string[];
}
