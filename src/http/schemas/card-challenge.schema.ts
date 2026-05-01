export const startChallengeBodySchema = {
  type: 'object',
  required: ['order_id', 'payment_method_id'],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    payment_method_id: { type: 'string', minLength: 1, maxLength: 255 },
    customer_id: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const;

export const verifyChallengeBodySchema = {
  type: 'object',
  required: ['challenge_id', 'amount_cents'],
  properties: {
    challenge_id: { type: 'string', format: 'uuid' },
    amount_cents: { type: 'integer', minimum: 1, maximum: 999 },
  },
  additionalProperties: false,
} as const;

export const chooseIdBodySchema = {
  type: 'object',
  required: ['challenge_id'],
  properties: {
    challenge_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;
