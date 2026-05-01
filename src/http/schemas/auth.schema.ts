const authBodyProperties = {
  action: {
    type: 'string',
    enum: ['sign_in', 'sign_up', 'password_reset', 'send-otp', 'verify-otp'],
  },
  email: { type: 'string', maxLength: 254 },
  password: { type: 'string', minLength: 6, maxLength: 128 },
  phone: { type: 'string', maxLength: 20 },
  recaptcha_token: { type: 'string' },
  platform: { type: 'string', enum: ['web', 'mobile_ios', 'mobile_android', 'mobile'] },
  full_name: { type: 'string', maxLength: 50 },
  country: { type: 'string', maxLength: 2 },
  fingerprint_hash: { type: 'string', maxLength: 128 },
  referral_code: { type: 'string', maxLength: 50 },
  otp_code: { type: 'string', maxLength: 10 },
} as const;

export const authRequestSchema = {
  type: 'object',
  required: ['action'],
  properties: authBodyProperties,
  additionalProperties: false,
} as const;

export const authActionRouteSchema = {
  type: 'object',
  properties: authBodyProperties,
  additionalProperties: false,
} as const;
