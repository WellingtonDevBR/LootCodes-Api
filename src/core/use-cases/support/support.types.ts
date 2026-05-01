export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id?: string;
  guest_email?: string;
  subject: string;
  status: string;
  priority?: string;
  order_id?: string;
  created_at?: string;
  updated_at?: string;
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
