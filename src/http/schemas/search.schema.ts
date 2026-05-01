export const searchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: 'string', maxLength: 100 },
    platform: { type: 'string', maxLength: 100 },
    priceMin: { type: 'number', minimum: 0 },
    priceMax: { type: 'number', minimum: 0 },
    inStock: { type: 'boolean' },
    page: { type: 'integer', minimum: 0, default: 0 },
    hitsPerPage: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;
