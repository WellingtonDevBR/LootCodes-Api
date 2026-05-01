export const guestTokenHeaderSchema = {
  type: 'object',
  properties: {
    'x-guest-token': { type: 'string', minLength: 1 },
  },
} as const;

export const guestOrderParamsSchema = {
  type: 'object',
  required: ['orderId'],
  properties: {
    orderId: { type: 'string', format: 'uuid' },
  },
} as const;

export const guestRevealKeyBodySchema = {
  type: 'object',
  required: ['order_id', 'key_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    key_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const guestCreateTicketBodySchema = {
  type: 'object',
  required: ['subject', 'message'],
  properties: {
    subject: { type: 'string', minLength: 1, maxLength: 200 },
    message: { type: 'string', minLength: 1, maxLength: 5000 },
    order_id: { type: 'string', format: 'uuid' },
    category: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const;

export const guestSessionExchangeBodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
