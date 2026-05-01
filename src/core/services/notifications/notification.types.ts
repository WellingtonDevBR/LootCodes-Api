export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  type?: string;
  read: boolean;
  data?: Record<string, unknown>;
  created_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  orders: boolean;
  promotions: boolean;
  stock_alerts: boolean;
  support: boolean;
  security: boolean;
}

export interface UpdatePreferencesDto {
  orders?: boolean;
  promotions?: boolean;
  stock_alerts?: boolean;
  support?: boolean;
  security?: boolean;
}

export interface PushToken {
  user_id: string;
  token: string;
  platform: 'web' | 'ios' | 'android';
}
