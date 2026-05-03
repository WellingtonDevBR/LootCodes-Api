export const getOrdersQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    offset: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
} as const;

export const orderIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const itemIdParamsSchema = {
  type: 'object',
  required: ['itemId'],
  properties: {
    itemId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const keyIdParamsSchema = {
  type: 'object',
  required: ['keyId'],
  properties: {
    keyId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const revealKeyBodySchema = {
  type: 'object',
  required: ['order_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const checkKeyViewedQuerySchema = {
  type: 'object',
  required: ['order_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const validateAccessTokenBodySchema = {
  type: 'object',
  required: ['token', 'order_id'],
  properties: {
    token: { type: 'string', minLength: 1 },
    order_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const claimGuestOrderBodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const logKeyViewBodySchema = {
  type: 'object',
  required: ['order_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    access_token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const logAccessAttemptBodySchema = {
  type: 'object',
  required: ['success'],
  properties: {
    token: { type: 'string', minLength: 1 },
    order_id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email', maxLength: 254 },
    success: { type: 'boolean' },
    failure_reason: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const;

export const generateAccessTokenBodySchema = {
  type: 'object',
  required: ['order_id', 'email'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email', maxLength: 254 },
  },
  additionalProperties: false,
} as const;

export const refreshAccessTokenBodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const productKeyIdParamsSchema = {
  type: 'object',
  required: ['productKeyId'],
  properties: {
    productKeyId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const verificationTicketQuerystringSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['id_verification', 'security_verification', 'all'] },
  },
  additionalProperties: false,
} as const;
