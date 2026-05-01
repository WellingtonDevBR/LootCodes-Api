export const listNotificationsQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    offset: { type: 'integer', minimum: 0, default: 0 },
  },
  additionalProperties: false,
} as const;

export const markReadParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;

export const updatePreferencesSchema = {
  type: 'object',
  properties: {
    orders: { type: 'boolean' },
    promotions: { type: 'boolean' },
    stock_alerts: { type: 'boolean' },
    support: { type: 'boolean' },
    security: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

export const registerPushTokenSchema = {
  type: 'object',
  required: ['token', 'platform'],
  properties: {
    token: { type: 'string', maxLength: 512 },
    platform: { type: 'string', enum: ['web', 'ios', 'android'] },
  },
  additionalProperties: false,
} as const;

export const removePushTokenSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', maxLength: 512 },
  },
  additionalProperties: false,
} as const;
