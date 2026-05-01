export const ledgerQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    before: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const orderEarningsBodySchema = {
  type: 'object',
  required: ['order_ids'],
  properties: {
    order_ids: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1, maxItems: 200 },
  },
  additionalProperties: false,
} as const;
