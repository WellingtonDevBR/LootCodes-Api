export const createTicketBodySchema = {
  type: 'object',
  required: ['subject', 'message'],
  properties: {
    subject: { type: 'string', minLength: 1, maxLength: 200 },
    message: { type: 'string', minLength: 1, maxLength: 5000 },
    order_id: { type: 'string', format: 'uuid' },
    order_item_id: { type: 'string', format: 'uuid' },
    product_key_id: { type: 'string', format: 'uuid' },
    category: { type: 'string', maxLength: 50 },
    ticket_type: { type: 'string', maxLength: 50 },
    description: { type: 'string', maxLength: 5000 },
    guest_email: { type: 'string', format: 'email', maxLength: 254 },
    email: { type: 'string', format: 'email', maxLength: 254 },
    sender_name: { type: 'string', maxLength: 100 },
    attachments: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          original_filename: { type: 'string' },
          file_size: { type: 'number' },
          mime_type: { type: 'string' },
        },
      },
    },
  },
  additionalProperties: false,
} as const;

export const ticketNumberParamsSchema = {
  type: 'object',
  required: ['ticketNumber'],
  properties: {
    ticketNumber: { type: 'string', minLength: 1, maxLength: 20 },
  },
  additionalProperties: false,
} as const;

export const ticketDetailQuerySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', maxLength: 254 },
  },
  additionalProperties: false,
} as const;

export const addMessageBodySchema = {
  type: 'object',
  required: ['ticket_number', 'message'],
  properties: {
    ticket_number: { type: 'string', minLength: 1, maxLength: 20 },
    message: { type: 'string', minLength: 1, maxLength: 5000 },
    sender_email: { type: 'string', format: 'email', maxLength: 254 },
    sender_name: { type: 'string', maxLength: 100 },
    attachments: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          original_filename: { type: 'string' },
          file_size: { type: 'number' },
          mime_type: { type: 'string' },
        },
      },
    },
  },
  additionalProperties: false,
} as const;

export const updateStatusBodySchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] },
    reason: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const;

export const reopenTicketBodySchema = {
  type: 'object',
  properties: {
    reason: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const;

export const submitFeedbackBodySchema = {
  type: 'object',
  required: ['ticket_number', 'rating'],
  properties: {
    ticket_number: { type: 'string', minLength: 1, maxLength: 20 },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    comment: { type: 'string', maxLength: 1000 },
  },
  additionalProperties: false,
} as const;

export const orderIdParamsSchema = {
  type: 'object',
  required: ['orderId'],
  properties: {
    orderId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
} as const;
