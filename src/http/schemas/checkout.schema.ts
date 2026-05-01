const cartItemSchema = {
  type: 'object',
  required: ['variant_id', 'quantity'],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    quantity: { type: 'integer', minimum: 1, maximum: 10 },
  },
  additionalProperties: false,
} as const;

export const initCheckoutBodySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: { type: 'array', items: cartItemSchema, minItems: 1, maxItems: 20 },
    currency: { type: 'string', maxLength: 3 },
    promo_code: { type: 'string', maxLength: 50 },
    session_id: { type: 'string', format: 'uuid' },
    fingerprint_hash: { type: 'string', maxLength: 128 },
    recaptcha_token: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const updateCheckoutBodySchema = {
  type: 'object',
  required: ['order_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    items: { type: 'array', items: cartItemSchema, minItems: 1, maxItems: 20 },
    promo_code: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const;

export const cancelCheckoutParamsSchema = {
  type: 'object',
  required: ['orderId'],
  properties: {
    orderId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const validatePromoBodySchema = {
  type: 'object',
  required: ['code', 'items'],
  properties: {
    code: { type: 'string', minLength: 1, maxLength: 50 },
    items: { type: 'array', items: cartItemSchema, minItems: 1, maxItems: 20 },
  },
  additionalProperties: false,
} as const;
