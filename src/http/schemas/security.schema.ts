export const holdIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;

export const uploadDocumentBodySchema = {
  type: 'object',
  required: ['path', 'content_type'],
  properties: {
    path: { type: 'string', minLength: 1, maxLength: 500 },
    content_type: { type: 'string', minLength: 1, maxLength: 100 },
  },
  additionalProperties: false,
} as const;

export const submitResponseBodySchema = {
  type: 'object',
  required: ['responses', 'evidence_urls', 'email'],
  properties: {
    responses: { type: 'object' },
    evidence_urls: {
      type: 'array',
      items: { type: 'string', minLength: 1, maxLength: 2000 },
      maxItems: 10,
    },
    email: { type: 'string', format: 'email', maxLength: 254 },
  },
  additionalProperties: false,
} as const;
