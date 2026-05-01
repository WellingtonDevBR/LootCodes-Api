export const batchEventsBodySchema = {
  type: 'object',
  required: ['events'],
  properties: {
    session_id: { type: 'string', minLength: 1 },
    events: {
      type: 'array',
      minItems: 1,
      maxItems: 200,
      items: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', minLength: 1, maxLength: 50 },
          payload: { type: 'object' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

export const cartEventBodySchema = {
  type: 'object',
  required: ['session_id', 'action'],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    action: { type: 'string', enum: ['add', 'remove', 'checkout_started', 'checkout_completed', 'checkout_abandoned'] },
    variant_id: { type: 'string', format: 'uuid' },
    quantity: { type: 'integer', minimum: 1 },
    metadata: { type: 'object' },
  },
  additionalProperties: false,
} as const;

export const sessionOutcomeBodySchema = {
  type: 'object',
  required: ['session_id', 'outcome'],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    outcome: { type: 'string', maxLength: 50 },
    conversion_value: { type: 'number', minimum: 0 },
  },
  additionalProperties: false,
} as const;
