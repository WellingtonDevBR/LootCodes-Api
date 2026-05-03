export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  phone?: string;
  account_status?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpsertProfileDto {
  full_name?: string;
  country?: string;
  phone?: string;
}

export interface ChangeEmailDto {
  new_email: string;
  password: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface UserSession {
  id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  client_channel?: string;
  started_at?: string;
  last_active_at?: string;
}

export interface UpsertSessionDto {
  session_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  client_channel?: string;
  fingerprint_hash?: string;
  merge_anonymous?: boolean;
  /** Defaults true when omitted (checkout / profile consolidate). */
  auto_consolidate?: boolean;
}
