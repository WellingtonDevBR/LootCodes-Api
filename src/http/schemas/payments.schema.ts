export const verifyPaymentBodySchema = {
  type: 'object',
  required: ['payment_intent_id'],
  properties: {
    payment_intent_id: { type: 'string', minLength: 1, maxLength: 255 },
    order_id: { type: 'string', format: 'uuid' },
    recaptcha_token: { type: 'string' },
    recaptcha_unavailable: { type: 'boolean' },
    /** Reserved for Enterprise mobile routing parity; optional */
    recaptcha_platform: { type: 'string', maxLength: 16 },
    session_id: { type: 'string', maxLength: 128 },
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
    provider: { type: 'string', enum: ['stripe', 'paypal'] },
  },
  additionalProperties: false,
} as const;
