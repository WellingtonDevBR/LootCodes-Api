export const listReferralsQuerySchema = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['referrer', 'referee'] },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    before: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const leaderboardQuerySchema = {
  type: 'object',
  properties: {
    days: { type: 'integer', minimum: 1, maximum: 365 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
  },
  additionalProperties: false,
} as const;

export const openDisputeBodySchema = {
  type: 'object',
  required: ['referral_id', 'reason'],
  properties: {
    referral_id: { type: 'string', format: 'uuid' },
    reason: { type: 'string', minLength: 10, maxLength: 1000 },
  },
  additionalProperties: false,
} as const;
