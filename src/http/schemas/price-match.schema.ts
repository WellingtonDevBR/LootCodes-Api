export const submitClaimBodySchema = {
  type: 'object',
  required: [
    'variant_id',
    'competitor_url',
    'competitor_price_cents',
    'competitor_currency',
    'display_currency',
    'screenshot_base64',
    'screenshot_mime',
  ],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    competitor_url: { type: 'string', format: 'uri', maxLength: 2048 },
    competitor_price_cents: { type: 'integer', minimum: 1 },
    competitor_currency: { type: 'string', minLength: 3, maxLength: 3 },
    display_currency: { type: 'string', minLength: 3, maxLength: 3 },
    screenshot_base64: { type: 'string', minLength: 1 },
    screenshot_mime: { type: 'string', enum: ['image/png', 'image/jpeg', 'image/webp'] },
    guest_email: { type: 'string', format: 'email', maxLength: 320 },
    fingerprint_hash: { type: 'string', maxLength: 128 },
  },
  additionalProperties: false,
} as const;

export const claimIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;
