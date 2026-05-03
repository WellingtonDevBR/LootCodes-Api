export const updateProfileSchema = {
  type: 'object',
  properties: {
    full_name: { type: 'string', maxLength: 50 },
    country: { type: 'string', maxLength: 2 },
    phone: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const;

export const changeEmailSchema = {
  type: 'object',
  required: ['new_email', 'password'],
  properties: {
    new_email: { type: 'string', maxLength: 254 },
    password: { type: 'string', minLength: 6, maxLength: 128 },
  },
  additionalProperties: false,
} as const;

export const changePasswordSchema = {
  type: 'object',
  required: ['current_password', 'new_password'],
  properties: {
    current_password: { type: 'string', minLength: 6, maxLength: 128 },
    new_password: { type: 'string', minLength: 6, maxLength: 128 },
  },
  additionalProperties: false,
} as const;

export const upsertSessionSchema = {
  type: 'object',
  required: ['session_id'],
  properties: {
    session_id: { type: 'string', minLength: 1 },
    user_id: { type: 'string', format: 'uuid' },
    ip_address: { type: 'string', maxLength: 45 },
    user_agent: { type: 'string', maxLength: 512 },
    client_channel: { type: 'string', enum: ['web', 'mobile_app'] },
    fingerprint_hash: { type: 'string', maxLength: 128 },
    merge_anonymous: { type: 'boolean' },
    auto_consolidate: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

export const terminateSessionParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;
