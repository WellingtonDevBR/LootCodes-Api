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
  required: ['session_id', 'event_type'],
  properties: {
    session_id: { type: 'string', minLength: 1 },
    user_id: { type: 'string' },
    event_type: { type: 'string', maxLength: 50 },
    variant_id: { type: 'string' },
    product_id: { type: 'string' },
    quantity: { type: 'integer', minimum: 1 },
    cart_value: { type: 'number' },
    guest_email: { type: 'string' },
    user_agent: { type: 'string' },
    page_path: { type: 'string' },
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
