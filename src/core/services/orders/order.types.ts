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

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
