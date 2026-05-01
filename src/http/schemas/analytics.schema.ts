export const batchEventsBodySchema = {
  type: 'object',
  required: ['events'],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    events: {
      type: 'array',
      minItems: 1,
      maxItems: 100,
      items: {
        type: 'object',
        properties: {
          session_id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          path: { type: 'string', maxLength: 500 },
          referrer: { type: 'string', maxLength: 500 },
          event_type: { type: 'string', maxLength: 100 },
          element_id: { type: 'string', maxLength: 200 },
          metadata: { type: 'object' },
          timestamp: { type: 'string' },
        },
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
