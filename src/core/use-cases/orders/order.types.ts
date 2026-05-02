export interface Order {
  id: string;
  user_id?: string;
  guest_email?: string;
  status: string;
  total_cents: number;
  currency: string;
  payment_intent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
}

export interface ProductKey {
  id: string;
  order_item_id: string;
  encrypted_key?: string;
  key_state: string;
  revealed_at?: string;
}

export interface OrderAccessToken {
  token: string;
  order_id: string;
  email: string;
  expires_at: string;
  created_at: string;
}

export interface KeyViewLog {
  key_id: string;
  order_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
}

export interface OrderAccessTokenMetadata {
  first_accessed_at: string | null;
  access_expires_at: string | null;
  expires_at: string;
}

export interface KeyAccessAttemptLog {
  token?: string;
  order_id?: string;
  email?: string;
  success: boolean;
  failure_reason?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Rich order shape for the dashboard (user-facing, no sensitive fields)
export interface UserOrderItemRelation {
  id: string;
  quantity: number;
  variant_id: string;
  activation_instructions?: string;
  status?: string;
  created_at?: string;
  unit_price?: number | null;
  products: { name: string; platform: string };
  product_variants?: {
    id: string;
    variant_platforms?: Array<{ product_platforms?: { name: string } }>;
    product_regions?: { name: string };
  };
}

export interface UserOrderKeyRelation {
  id: string;
  is_used: boolean;
  used_at?: string;
  variant_id: string;
}

export interface UserOrderPriceAdjustment {
  order_item_id: string;
  refund_cents: number;
  original_cents: number;
  adjusted_cents: number;
  currency: string;
  created_at: string;
}

export interface UserOrderWithRelations {
  id: string;
  order_number: string;
  status: string;
  fulfillment_status: string;
  refund_status?: string;
  refunded_at?: string;
  keys_revealed_at?: string;
  total_amount: number;
  currency: string;
  created_at: string;
  promo_code_id?: string | null;
  discount_amount_cents?: number | null;
  order_items: UserOrderItemRelation[];
  product_keys?: UserOrderKeyRelation[];
  order_item_price_adjustments?: UserOrderPriceAdjustment[];
}

/** Rich order detail for the order page — matches the old order-access Edge Function response */
export interface OrderAccessResponse {
  order: {
    id: string;
    order_number: string;
    total_amount: number;
    currency: string;
    status: string;
    fulfillment_status: string;
    refund_status: string | null;
    delivery_email: string;
    guest_email: string | null;
    customer_full_name: string | null;
    user_id: string;
    created_at: string;
    keys_revealed_at: string | null;
    discount_amount_cents: number | null;
    promo_code_id: string | null;
    order_items: OrderAccessItem[];
  };
  product_keys: OrderAccessKey[];
}

export interface OrderAccessItem {
  id: string;
  status: string;
  products: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    release_date: string | null;
    expected_delivery_date: string | null;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  product_variants: {
    id: string;
    sku: string | null;
    face_value: string | null;
    release_date: string | null;
    product_regions: { code: string; name: string } | null;
    variant_platforms: Array<{
      product_platforms: {
        code: string;
        name: string;
        key_display_label: string | null;
        redemption_url_template: string | null;
      };
    }>;
    activation_instructions: string | null;
  };
  activation_instructions: string | null;
}

export interface OrderAccessKey {
  id: string;
  variant_id: string;
  is_used: boolean;
  is_assigned: boolean;
  created_at: string;
  first_revealed_at: string | null;
  key_state: string;
}
