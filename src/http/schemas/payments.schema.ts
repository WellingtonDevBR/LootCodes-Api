export const verifyPaymentBodySchema = {
  type: 'object',
  required: ['payment_intent_id'],
  properties: {
    payment_intent_id: { type: 'string', minLength: 1, maxLength: 255 },
    order_id: { type: 'string', format: 'uuid' },
    recaptcha_token: { type: 'string' },
    session_id: { type: 'string', format: 'uuid' },
    fingerprint_hash: { type: 'string', maxLength: 128 },
  },
  additionalProperties: false,
} as const;

export const capturePaymentBodySchema = {
  type: 'object',
  required: ['payment_intent_id'],
  properties: {
    payment_intent_id: { type: 'string', minLength: 1, maxLength: 255 },
    order_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const stripeWebhookHeadersSchema = {
  type: 'object',
  required: ['stripe-signature'],
  properties: {
    'stripe-signature': { type: 'string' },
  },
} as const;
