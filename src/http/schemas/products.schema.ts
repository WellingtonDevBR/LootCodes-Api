export const slugParamsSchema = {
  type: 'object',
  required: ['slug'],
  properties: {
    slug: { type: 'string', minLength: 1, maxLength: 200 },
  },
} as const;

export const productIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;

export const batchStockCheckBodySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      minItems: 1,
      maxItems: 50,
      items: {
        type: 'object',
        required: ['variant_id', 'quantity'],
        properties: {
          variant_id: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

export const stockNotificationSubscribeBodySchema = {
  type: 'object',
  required: ['variant_id', 'email'],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email', maxLength: 254 },
  },
  additionalProperties: false,
} as const;

export const stockNotificationUnsubscribeBodySchema = {
  type: 'object',
  required: ['variant_id'],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const variantIdParamsSchema = {
  type: 'object',
  required: ['variantId'],
  properties: {
    variantId: { type: 'string', format: 'uuid' },
  },
} as const;

export const categoryIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;

export const pricingQuerySchema = {
  type: 'object',
  required: ['currency'],
  properties: {
    currency: { type: 'string', minLength: 3, maxLength: 3 },
  },
} as const;

export const batchPricingBodySchema = {
  type: 'object',
  required: ['variantIds', 'currency'],
  properties: {
    variantIds: {
      type: 'array',
      minItems: 1,
      maxItems: 50,
      items: { type: 'string', format: 'uuid' },
    },
    currency: { type: 'string', minLength: 3, maxLength: 3 },
  },
  additionalProperties: false,
} as const;

export const currencyParamsSchema = {
  type: 'object',
  required: ['currency'],
  properties: {
    currency: { type: 'string', minLength: 3, maxLength: 3 },
  },
} as const;

export const geoCheckQuerySchema = {
  type: 'object',
  required: ['regionId', 'countryCode'],
  properties: {
    regionId: { type: 'string', format: 'uuid' },
    countryCode: { type: 'string', minLength: 2, maxLength: 2 },
  },
} as const;

export const regionIdParamsSchema = {
  type: 'object',
  required: ['regionId'],
  properties: {
    regionId: { type: 'string', format: 'uuid' },
  },
} as const;

export const geoRestrictedVariantsQuerySchema = {
  type: 'object',
  required: ['countryCode'],
  properties: {
    countryCode: { type: 'string', minLength: 2, maxLength: 2 },
  },
} as const;

export const geoRestrictedRegionsQuerySchema = {
  type: 'object',
  required: ['countryCode'],
  properties: {
    countryCode: { type: 'string', minLength: 2, maxLength: 2 },
  },
} as const;
