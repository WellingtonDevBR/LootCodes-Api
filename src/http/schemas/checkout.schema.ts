const cartItemSchema = {
  type: 'object',
  required: ['variant_id', 'quantity'],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    quantity: { type: 'integer', minimum: 1, maximum: 10 },
  },
  additionalProperties: false,
} as const;

const billingAddressSchema = {
  type: 'object',
  required: ['line1', 'city', 'postal_code', 'country'],
  properties: {
    line1: { type: 'string', maxLength: 200 },
    line2: { type: 'string', maxLength: 200 },
    city: { type: 'string', maxLength: 100 },
    state: { type: 'string', maxLength: 100 },
    postal_code: { type: 'string', maxLength: 20 },
    country: { type: 'string', minLength: 2, maxLength: 2 },
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
    wallet_redeem_cents: { type: 'integer', minimum: 0 },
    customer_email: { type: 'string', format: 'email' },
    customer_name: { type: 'string', maxLength: 100 },
    billing_address: billingAddressSchema,
  },
  additionalProperties: false,
} as const;

export const approvalCheckoutBodySchema = {
  type: 'object',
  required: ['approval_token', 'hold_id', 'items'],
  properties: {
    approval_token: { type: 'string', minLength: 1 },
    hold_id: { type: 'string', format: 'uuid' },
    items: { type: 'array', items: cartItemSchema, minItems: 1, maxItems: 20 },
    currency: { type: 'string', minLength: 3, maxLength: 3 },
    promo_code: { type: 'string', maxLength: 50 },
    session_id: { type: 'string' },
    wallet_redeem_cents: { type: 'integer', minimum: 0 },
    customer_email: { type: 'string', format: 'email' },
    customer_name: { type: 'string', maxLength: 100 },
    billing_address: billingAddressSchema,
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
