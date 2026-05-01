export interface IStockNotificationRepository {
  subscribe(userId: string, variantId: string, email: string): Promise<void>;
  unsubscribe(userId: string, variantId: string): Promise<void>;
  isSubscribed(userId: string, variantId: string): Promise<boolean>;
}
