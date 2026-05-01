export const productIdParamsSchema = {
  type: 'object',
  required: ['productId'],
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
} as const;

export const reviewsPaginationQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    offset: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
} as const;

export const createReviewBodySchema = {
  type: 'object',
  required: ['product_id', 'rating'],
  properties: {
    product_id: { type: 'string', format: 'uuid' },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    title: { type: 'string', maxLength: 200 },
    body: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
} as const;

export const eligibilityParamsSchema = {
  type: 'object',
  required: ['productId'],
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
} as const;
