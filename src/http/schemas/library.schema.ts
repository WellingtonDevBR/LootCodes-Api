export const setLibraryStatusSchema = {
  type: 'object',
  required: ['product_id', 'status'],
  properties: {
    product_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['owned', 'playing', 'completed', 'backlog', 'wishlist'] },
    source: { type: 'string', enum: ['manual', 'purchase', 'gift', 'import'] },
  },
  additionalProperties: false,
} as const;

export const updateLibraryEntrySchema = {
  type: 'object',
  properties: {
    hours_played: { type: 'number', minimum: 0 },
    user_rating: { type: 'number', minimum: 0, maximum: 10 },
    notes: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
} as const;

export const libraryProductParamsSchema = {
  type: 'object',
  required: ['productId'],
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
} as const;
