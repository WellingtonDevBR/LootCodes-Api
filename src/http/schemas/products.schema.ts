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
