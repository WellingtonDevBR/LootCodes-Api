export const TOKENS = {
  // Infrastructure (low-level)
  Database: Symbol.for('IDatabase'),

  // Auth
  AuthProvider: Symbol.for('IAuthProvider'),
  UserRepository: Symbol.for('IUserRepository'),
  RecaptchaVerifier: Symbol.for('IRecaptchaVerifier'),
  RateLimiter: Symbol.for('IRateLimiter'),
  IpBlocklist: Symbol.for('IIpBlocklist'),
  AuthService: Symbol.for('IAuthService'),

  // Profile
  UserProfileRepository: Symbol.for('IUserProfileRepository'),
  AvatarStorage: Symbol.for('IAvatarStorage'),
  SessionRepository: Symbol.for('ISessionRepository'),
  ProfileService: Symbol.for('IProfileService'),

  // Orders + Key Delivery
  OrderRepository: Symbol.for('IOrderRepository'),
  ProductKeyRepository: Symbol.for('IProductKeyRepository'),
  OrderAccessTokenRepository: Symbol.for('IOrderAccessTokenRepository'),
  PaymentGateway: Symbol.for('IPaymentGateway'),
  OrderService: Symbol.for('IOrderService'),
  KeyDeliveryService: Symbol.for('IKeyDeliveryService'),

  // Checkout
  PaymentProvider: Symbol.for('IPaymentProvider'),
  CheckoutRepository: Symbol.for('ICheckoutRepository'),
  PromoCodeValidator: Symbol.for('IPromoCodeValidator'),
  CartValidator: Symbol.for('ICartValidator'),
  CheckoutService: Symbol.for('ICheckoutService'),

  // Support
  SupportTicketRepository: Symbol.for('ISupportTicketRepository'),
  AttachmentStorage: Symbol.for('IAttachmentStorage'),
  SupportService: Symbol.for('ISupportService'),

  // Library / Wishlist
  UserLibraryRepository: Symbol.for('IUserLibraryRepository'),
  LibraryService: Symbol.for('ILibraryService'),

  // Notifications
  NotificationRepository: Symbol.for('INotificationRepository'),
  NotificationPreferencesRepository: Symbol.for('INotificationPreferencesRepository'),
  PushTokenRepository: Symbol.for('IPushTokenRepository'),
  NotificationService: Symbol.for('INotificationService'),

  // Reviews
  ReviewRepository: Symbol.for('IReviewRepository'),
  ReviewService: Symbol.for('IReviewService'),

  // Products
  ProductRepository: Symbol.for('IProductRepository'),
  ReferenceDataRepository: Symbol.for('IReferenceDataRepository'),
  StockNotificationRepository: Symbol.for('IStockNotificationRepository'),
  ProductService: Symbol.for('IProductService'),

  // Analytics
  AnalyticsRepository: Symbol.for('IAnalyticsRepository'),
  GeoService: Symbol.for('IGeoService'),
  AnalyticsService: Symbol.for('IAnalyticsService'),

  // Wallet
  WalletRepository: Symbol.for('IWalletRepository'),
  WalletService: Symbol.for('IWalletService'),

  // Referrals
  ReferralRepository: Symbol.for('IReferralRepository'),
  ReferralService: Symbol.for('IReferralService'),

  // Newsletter
  NewsletterRepository: Symbol.for('INewsletterRepository'),
  NewsletterService: Symbol.for('INewsletterService'),

  // Security / Verification
  SecurityHoldRepository: Symbol.for('ISecurityHoldRepository'),
  VerificationStorage: Symbol.for('IVerificationStorage'),
  SecurityService: Symbol.for('ISecurityService'),

  // Card Challenge
  CardChallengeRepository: Symbol.for('ICardChallengeRepository'),
  MicroAuthProvider: Symbol.for('IMicroAuthProvider'),
  CardChallengeService: Symbol.for('ICardChallengeService'),

  // Price Match
  PriceMatchRepository: Symbol.for('IPriceMatchRepository'),
  PriceMatchService: Symbol.for('IPriceMatchService'),

  // Payment Verification + Capture
  PaymentVerifier: Symbol.for('IPaymentVerifier'),
  RiskAssessor: Symbol.for('IRiskAssessor'),
  FulfillmentService: Symbol.for('IFulfillmentService'),
  PaymentVerificationService: Symbol.for('IPaymentVerificationService'),
  PaymentCapturer: Symbol.for('IPaymentCapturer'),
  PaymentCaptureService: Symbol.for('IPaymentCaptureService'),

  // Webhooks
  WebhookVerifier: Symbol.for('IWebhookVerifier'),
  WebhookHandler: Symbol.for('IWebhookHandler'),
  WebhookService: Symbol.for('IWebhookService'),

  // Guest Access
  GuestSessionRepository: Symbol.for('IGuestSessionRepository'),
  GuestAccessService: Symbol.for('IGuestAccessService'),

  // Shared
  EmailSender: Symbol.for('IEmailSender'),
  EventBus: Symbol.for('IEventBus'),
} as const;
