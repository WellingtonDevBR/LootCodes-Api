export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id?: string;
  guest_email?: string;
  subject: string;
  description?: string | null;
  ticket_type?: string | null;
  status: string;
  priority?: string;
  order_id?: string | null;
  order_item_id?: string | null;
  product_key_id?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface SupportTicketWithMessages extends SupportTicket {
  ticket_messages?: Array<{ created_at: string }>;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  message: string;
  attachments?: string[];
  created_at?: string;
}

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

export interface TicketDetail {
  ticket: SupportTicket;
  messages: TicketMessage[];
}
