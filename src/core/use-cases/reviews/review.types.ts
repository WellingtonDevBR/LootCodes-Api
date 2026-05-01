export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  verified_purchase: boolean;
  created_at?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface CreateReviewDto {
  product_id: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface ReviewEligibility {
  eligible: boolean;
  reason?: string;
}

export interface ReviewPaginationParams {
  limit?: number;
  offset?: number;
}
