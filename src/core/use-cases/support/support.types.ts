// ─── Order data embedded in ticket detail ────────────────────────

export interface SupportTicketOrder {
  order_number: string;
  status: string;
  fulfillment_status?: string | null;
  refund_status?: string | null;
  refunded_at?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  order_channel?: string | null;
  contact_email?: string | null;
  delivery_email?: string | null;
  guest_email?: string | null;
}

// ─── Ticket attachment ───────────────────────────────────────────

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id?: string | null;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string | null;
  created_at: string;
}

// ─── Core ticket ─────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id?: string;
  guest_email?: string;
  customer_email?: string | null;
  order_contact_email?: string | null;
  customer_name?: string | null;
  source?: string | null;
  source_channel?: string | null;
  subject: string;
  description?: string | null;
  ticket_type?: string | null;
  status: string;
  priority?: string;
  order_id?: string | null;
  order_item_id?: string | null;
  product_key_id?: string | null;
  issue_context?: Record<string, unknown> | null;
  assigned_to?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  first_response_at?: string | null;
  customer_feedback_rating?: number | null;
  customer_feedback_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SupportTicketWithMessages extends SupportTicket {
  ticket_messages?: Array<{ created_at: string }>;
}

// ─── Ticket message ──────────────────────────────────────────────

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id?: string | null;
  sender_email?: string | null;
  sender_name?: string | null;
  message: string;
  is_internal?: boolean;
  attachments?: TicketAttachment[] | string[];
  created_at?: string;
}

// ─── DTOs ────────────────────────────────────────────────────────

export interface CreateTicketDto {
  subject: string;
  message: string;
  order_id?: string;
  category?: string;
  guest_email?: string;
  ticket_type?: string;
  description?: string;
  sender_name?: string;
  source?: string;
  source_channel?: string;
  metadata?: Record<string, unknown>;
}

export interface AddMessageDto {
  ticket_number: string;
  message: string;
}

export interface TicketFeedbackDto {
  ticket_number: string;
  rating: number;
  comment?: string;
}

// ─── Ticket detail (rich response) ───────────────────────────────

export interface TicketDetail {
  ticket: SupportTicket;
  messages: TicketMessage[];
  order?: SupportTicketOrder | null;
  attachments?: TicketAttachment[];
}
