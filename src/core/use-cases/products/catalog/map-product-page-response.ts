import type {
  StorefrontProductPageData,
  StorefrontProduct,
  StorefrontVariant,
  StorefrontGalleryItem,
} from '../product.types.js';

const SAFE_PRODUCT_FIELDS = new Set([
  'id', 'name', 'slug', 'description', 'short_description',
  'seo_title', 'seo_description', 'seo_keywords',
  'product_type', 'category', 'developer', 'publisher', 'rating', 'tags', 'featured',
  'image_url', 'cover_image_url', 'release_date', 'is_active', 'delivery_type',
  'expected_delivery_date', 'preorder_delivery_info', 'preorder_start_date', 'preorder_end_date',
  'created_at', 'updated_at', 'currency', 'price_usd',
  'discount_percentage', 'availability_status',
  'review_count', 'customer_rating', 'metacritic_score',
  'product_translations', 'product_genres',
]);

const SAFE_VARIANT_FIELDS = new Set([
  'id', 'slug', 'product_id', 'region_id',
  'price_usd', 'retail_price_usd', 'face_value',
  'is_active', 'purchasable', 'release_date',
  'activation_instructions', 'system_requirements',
  'image_url', 'languages', 'platforms', 'region',
  'variant_translations', 'created_at', 'updated_at',
]);

function pickFields<T extends Record<string, unknown>>(raw: T, allowed: Set<string>): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in raw) {
      result[key] = raw[key];
    }
  }
  return result as Partial<T>;
}

/**
 * Sanitize the raw `get_product_page_data` RPC response for storefront consumption.
 * - Converts `key_counts` (numeric) to `stock_status` (boolean).
 * - Strips internal/sensitive fields (force_available, created_by, etc.).
 */
export function mapProductPageResponse(raw: Record<string, unknown>): StorefrontProductPageData {
  const variants = (raw.variants as Record<string, unknown>[]) ?? [];
  const keyCounts = (raw.key_counts as Record<string, number>) ?? {};
  const gallery = (raw.gallery as StorefrontGalleryItem[]) ?? [];
  const matchedVariantId = (raw.matched_variant_id as string | null) ?? null;

  const stock_status: Record<string, boolean> = {};
  for (const [variantId, count] of Object.entries(keyCounts)) {
    stock_status[variantId] = count > 0;
  }

  const safeVariants: StorefrontVariant[] = variants.map((v) => {
    const picked = pickFields(v, SAFE_VARIANT_FIELDS) as unknown as StorefrontVariant;
    if (typeof picked.purchasable !== 'boolean') {
      picked.purchasable = stock_status[picked.id] ?? false;
    }
    return picked;
  });

  const {
    variants: _v, key_counts: _kc, gallery: _g, matched_variant_id: _m,
    ...productRaw
  } = raw;
  const product = pickFields(productRaw as Record<string, unknown>, SAFE_PRODUCT_FIELDS) as unknown as StorefrontProduct;

  return {
    product,
    variants: safeVariants,
    gallery,
    stock_status,
    matchedVariantId,
  };
}
