export const subscribeBodySchema = {
  type: 'object',
  required: ['email', 'consent', 'recaptcha_token'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 320 },
    consent: { type: 'boolean' },
    language_code: { type: 'string', maxLength: 5 },
    recaptcha_token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const tokenBodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
