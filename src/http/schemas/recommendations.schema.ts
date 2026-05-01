export const productIdParamsSchema = {
  type: 'object',
  required: ['productId'],
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
} as const;

export const limitQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 8 },
  },
} as const;

export const alsoViewedQuerySchema = {
  type: 'object',
  properties: {
    daysBack: { type: 'integer', minimum: 1, maximum: 365, default: 30 },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 8 },
  },
} as const;

export const boughtTogetherQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 20, default: 4 },
  },
} as const;

export const personalizedQuerySchema = {
  type: 'object',
  required: ['sessionId'],
  properties: {
    sessionId: { type: 'string', minLength: 1, maxLength: 200 },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 12 },
  },
} as const;

export const popularQuerySchema = {
  type: 'object',
  properties: {
    daysBack: { type: 'integer', minimum: 1, maximum: 365, default: 30 },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 8 },
  },
} as const;

export const latestReleasesQuerySchema = {
  type: 'object',
  properties: {
    daysBack: { type: 'integer', minimum: 1, maximum: 730, default: 90 },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 8 },
  },
} as const;

export const preOrdersQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
  },
} as const;
