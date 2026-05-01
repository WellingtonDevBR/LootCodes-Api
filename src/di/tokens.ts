export const TOKENS = {
  // Infrastructure (low-level)
  Database: Symbol.for('IDatabase'),

  // Auth
  AuthProvider: Symbol.for('IAuthProvider'),
  UserRepository: Symbol.for('IUserRepository'),
  RecaptchaVerifier: Symbol.for('IRecaptchaVerifier'),
  RateLimiter: Symbol.for('IRateLimiter'),
  IpBlocklist: Symbol.for('IIpBlocklist'),

  // Profile
  UserProfileRepository: Symbol.for('IUserProfileRepository'),
  AvatarStorage: Symbol.for('IAvatarStorage'),
  SessionRepository: Symbol.for('ISessionRepository'),

  // Orders + Key Delivery
  OrderRepository: Symbol.for('IOrderRepository'),
  ProductKeyRepository: Symbol.for('IProductKeyRepository'),
  OrderAccessTokenRepository: Symbol.for('IOrderAccessTokenRepository'),
  PaymentGateway: Symbol.for('IPaymentGateway'),

  // Checkout
  PaymentProvider: Symbol.for('IPaymentProvider'),
  CheckoutRepository: Symbol.for('ICheckoutRepository'),
  PromoCodeValidator: Symbol.for('IPromoCodeValidator'),
  CartValidator: Symbol.for('ICartValidator'),

  // Support
  SupportTicketRepository: Symbol.for('ISupportTicketRepository'),
  AttachmentStorage: Symbol.for('IAttachmentStorage'),

  // Library / Wishlist
  UserLibraryRepository: Symbol.for('IUserLibraryRepository'),

  // Notifications
  NotificationRepository: Symbol.for('INotificationRepository'),
  NotificationPreferencesRepository: Symbol.for('INotificationPreferencesRepository'),
  PushTokenRepository: Symbol.for('IPushTokenRepository'),

  // Reviews
  ReviewRepository: Symbol.for('IReviewRepository'),

  // Products
  ProductRepository: Symbol.for('IProductRepository'),
  ReferenceDataRepository: Symbol.for('IReferenceDataRepository'),
  CategoryRepository: Symbol.for('ICategoryRepository'),
  PricingRepository: Symbol.for('IPricingRepository'),
  GeoRestrictionRepository: Symbol.for('IGeoRestrictionRepository'),
  StockNotificationRepository: Symbol.for('IStockNotificationRepository'),

  // Analytics
  AnalyticsRepository: Symbol.for('IAnalyticsRepository'),
  GeoService: Symbol.for('IGeoService'),

  // Wallet
  WalletRepository: Symbol.for('IWalletRepository'),

  // Referrals
  ReferralRepository: Symbol.for('IReferralRepository'),

  // Newsletter
  NewsletterRepository: Symbol.for('INewsletterRepository'),

  // Security / Verification
  SecurityHoldRepository: Symbol.for('ISecurityHoldRepository'),
  VerificationStorage: Symbol.for('IVerificationStorage'),

  // Card Challenge
  CardChallengeRepository: Symbol.for('ICardChallengeRepository'),
  MicroAuthProvider: Symbol.for('IMicroAuthProvider'),

  // Price Match
  PriceMatchRepository: Symbol.for('IPriceMatchRepository'),

  // Payment Verification + Capture
  PaymentVerifier: Symbol.for('IPaymentVerifier'),
  RiskAssessor: Symbol.for('IRiskAssessor'),
  FulfillmentService: Symbol.for('IFulfillmentService'),
  PaymentCapturer: Symbol.for('IPaymentCapturer'),

  // Webhooks
  WebhookVerifier: Symbol.for('IWebhookVerifier'),
  WebhookHandler: Symbol.for('IWebhookHandler'),

  // Guest Access
  GuestSessionRepository: Symbol.for('IGuestSessionRepository'),

  // Recommendations
  RecommendationRepository: Symbol.for('IRecommendationRepository'),

  // Search
  SearchProvider: Symbol.for('ISearchProvider'),

  // Shared
  EmailSender: Symbol.for('IEmailSender'),
  EventBus: Symbol.for('IEventBus'),
} as const;

export const UC_TOKENS = {
  // Profile use cases
  GetProfile: Symbol.for('GetProfileUseCase'),
  UpdateProfile: Symbol.for('UpdateProfileUseCase'),
  DeleteAccount: Symbol.for('DeleteAccountUseCase'),
  RestoreAccount: Symbol.for('RestoreAccountUseCase'),
  ChangeEmail: Symbol.for('ChangeEmailUseCase'),
  ChangePassword: Symbol.for('ChangePasswordUseCase'),
  GetRole: Symbol.for('GetRoleUseCase'),
  UpsertSession: Symbol.for('UpsertSessionUseCase'),
  GetActiveSessions: Symbol.for('GetActiveSessionsUseCase'),
  TerminateSession: Symbol.for('TerminateSessionUseCase'),
  UploadAvatar: Symbol.for('UploadAvatarUseCase'),

  // Order use cases
  GetOrder: Symbol.for('GetOrderUseCase'),
  GetOrderDetail: Symbol.for('GetOrderDetailUseCase'),
  GetUserOrders: Symbol.for('GetUserOrdersUseCase'),
  GetUserOrdersForSupport: Symbol.for('GetUserOrdersForSupportUseCase'),
  ValidateAccessToken: Symbol.for('ValidateAccessTokenUseCase'),
  GenerateAccessToken: Symbol.for('GenerateAccessTokenUseCase'),
  RefreshAccessToken: Symbol.for('RefreshAccessTokenUseCase'),
  ClaimGuestOrder: Symbol.for('ClaimGuestOrderUseCase'),

  // Key delivery use cases
  GetKeysForOrder: Symbol.for('GetKeysForOrderUseCase'),
  GetKeysForOrderItem: Symbol.for('GetKeysForOrderItemUseCase'),
  RevealKey: Symbol.for('RevealKeyUseCase'),
  CheckKeyViewed: Symbol.for('CheckKeyViewedUseCase'),
  VerifyPaymentForAccess: Symbol.for('VerifyPaymentForAccessUseCase'),

  // Support use cases
  CreateTicket: Symbol.for('CreateTicketUseCase'),
  GetTicket: Symbol.for('GetTicketUseCase'),
  GetUserTickets: Symbol.for('GetUserTicketsUseCase'),
  AddMessage: Symbol.for('AddMessageUseCase'),
  UpdateTicketStatus: Symbol.for('UpdateStatusUseCase'),
  SubmitFeedback: Symbol.for('SubmitFeedbackUseCase'),
  GetVerificationTickets: Symbol.for('GetVerificationTicketsUseCase'),
  UploadAttachment: Symbol.for('UploadAttachmentUseCase'),

  // Library use cases
  ListLibrary: Symbol.for('ListLibraryUseCase'),
  SetLibraryStatus: Symbol.for('SetLibraryStatusUseCase'),
  RemoveFromLibrary: Symbol.for('RemoveFromLibraryUseCase'),
  UpdateLibraryEntry: Symbol.for('UpdateLibraryEntryUseCase'),

  // Auth use cases
  HandleAuth: Symbol.for('HandleAuthUseCase'),

  // Checkout use cases
  InitializeCheckout: Symbol.for('InitializeCheckoutUseCase'),
  UpdateCheckout: Symbol.for('UpdateCheckoutUseCase'),
  CancelCheckout: Symbol.for('CancelCheckoutUseCase'),
  CheckoutWithApproval: Symbol.for('CheckoutWithApprovalUseCase'),
  ValidatePromoCode: Symbol.for('ValidatePromoCodeUseCase'),
  GetPaymentMethodsConfig: Symbol.for('GetPaymentMethodsConfigUseCase'),

  // Notification use cases
  ListNotifications: Symbol.for('ListNotificationsUseCase'),
  GetUnreadCount: Symbol.for('GetUnreadCountUseCase'),
  MarkRead: Symbol.for('MarkReadUseCase'),
  MarkAllRead: Symbol.for('MarkAllReadUseCase'),
  GetPreferences: Symbol.for('GetPreferencesUseCase'),
  UpdatePreferences: Symbol.for('UpdatePreferencesUseCase'),
  RegisterPushToken: Symbol.for('RegisterPushTokenUseCase'),
  RemovePushToken: Symbol.for('RemovePushTokenUseCase'),

  // Review use cases
  GetProductReviews: Symbol.for('GetProductReviewsUseCase'),
  GetProductRating: Symbol.for('GetProductRatingUseCase'),
  SubmitReview: Symbol.for('SubmitReviewUseCase'),
  CheckEligibility: Symbol.for('CheckEligibilityUseCase'),

  // Products — catalog
  GetProductBySlug: Symbol.for('GetProductBySlugUseCase'),
  GetProductById: Symbol.for('GetProductByIdUseCase'),
  GetVariants: Symbol.for('GetVariantsUseCase'),
  GetGallery: Symbol.for('GetGalleryUseCase'),
  GetFeatured: Symbol.for('GetFeaturedUseCase'),

  // Products — stock
  CheckStock: Symbol.for('CheckStockUseCase'),
  BatchCheckStock: Symbol.for('BatchCheckStockUseCase'),
  SubscribeStockNotification: Symbol.for('SubscribeStockNotificationUseCase'),
  UnsubscribeStockNotification: Symbol.for('UnsubscribeStockNotificationUseCase'),
  IsSubscribedToStock: Symbol.for('IsSubscribedToStockUseCase'),
  IsVariantPurchasable: Symbol.for('IsVariantPurchasableUseCase'),

  // Products — reference
  GetPlatforms: Symbol.for('GetPlatformsUseCase'),
  GetRegions: Symbol.for('GetRegionsUseCase'),
  GetGenres: Symbol.for('GetGenresUseCase'),
  GetFaqs: Symbol.for('GetFaqsUseCase'),
  GetPlatformBySlug: Symbol.for('GetPlatformBySlugUseCase'),
  GetPlatformNavItems: Symbol.for('GetPlatformNavItemsUseCase'),
  GetPlatformFamilyBySlug: Symbol.for('GetPlatformFamilyBySlugUseCase'),

  // Products — categories
  GetCategories: Symbol.for('GetCategoriesUseCase'),
  GetCategoryBySlug: Symbol.for('GetCategoryBySlugUseCase'),
  GetSubcategories: Symbol.for('GetSubcategoriesUseCase'),
  GetCategoryFaqs: Symbol.for('GetCategoryFaqsUseCase'),

  // Products — pricing
  GetLocalizedPrice: Symbol.for('GetLocalizedPriceUseCase'),
  GetBatchLocalizedPrices: Symbol.for('GetBatchLocalizedPricesUseCase'),
  HasPricesForCurrency: Symbol.for('HasPricesForCurrencyUseCase'),
  SyncCurrencyRates: Symbol.for('SyncCurrencyRatesUseCase'),

  // Products — geo
  IsCountryAllowed: Symbol.for('IsCountryAllowedUseCase'),
  GetExcludedCountries: Symbol.for('GetExcludedCountriesUseCase'),
  GetRestrictedVariants: Symbol.for('GetRestrictedVariantsUseCase'),
  GetRestrictedRegions: Symbol.for('GetRestrictedRegionsUseCase'),

  // Products — storefront
  GetActivePromoHeader: Symbol.for('GetActivePromoHeaderUseCase'),
  GetTrustpilotData: Symbol.for('GetTrustpilotDataUseCase'),

  // Analytics use cases
  TrackBatch: Symbol.for('TrackBatchUseCase'),
  TrackCartEvent: Symbol.for('TrackCartEventUseCase'),
  UpdateSessionOutcome: Symbol.for('UpdateSessionOutcomeUseCase'),
  Geolocate: Symbol.for('GeolocateUseCase'),
  TrackProductViewDuration: Symbol.for('TrackProductViewDurationUseCase'),
  TrackSearchEvent: Symbol.for('TrackSearchEventUseCase'),

  // Wallet use cases
  GetBalance: Symbol.for('GetBalanceUseCase'),
  ListLedger: Symbol.for('ListLedgerUseCase'),
  GetOrderEarnings: Symbol.for('GetOrderEarningsUseCase'),
  ClaimReviewReward: Symbol.for('ClaimReviewRewardUseCase'),

  // Referral use cases
  GetReferralMe: Symbol.for('GetReferralMeUseCase'),
  ListReferrals: Symbol.for('ListReferralsUseCase'),
  GetLeaderboard: Symbol.for('GetLeaderboardUseCase'),
  OpenDispute: Symbol.for('OpenDisputeUseCase'),

  // Newsletter use cases
  Subscribe: Symbol.for('SubscribeUseCase'),
  Confirm: Symbol.for('ConfirmUseCase'),
  Unsubscribe: Symbol.for('UnsubscribeUseCase'),

  // Security use cases
  GetHold: Symbol.for('GetHoldUseCase'),
  GetHoldStatus: Symbol.for('GetHoldStatusUseCase'),
  UploadDocument: Symbol.for('UploadDocumentUseCase'),
  SubmitHoldResponse: Symbol.for('SubmitResponseUseCase'),
  UnlockAccount: Symbol.for('UnlockAccountUseCase'),

  // Card challenge use cases
  StartChallenge: Symbol.for('StartChallengeUseCase'),
  VerifyChallenge: Symbol.for('VerifyChallengeUseCase'),
  ChooseId: Symbol.for('ChooseIdUseCase'),

  // Price match use cases
  SubmitClaim: Symbol.for('SubmitClaimUseCase'),
  GetUserClaims: Symbol.for('GetUserClaimsUseCase'),
  GetPriceMatchConfig: Symbol.for('GetPriceMatchConfigUseCase'),
  GetClaimPromoCode: Symbol.for('GetClaimPromoCodeUseCase'),

  // Payment use cases
  VerifyAndFulfill: Symbol.for('VerifyAndFulfillUseCase'),
  CapturePayment: Symbol.for('CapturePaymentUseCase'),

  // Webhook use cases
  HandleStripeWebhook: Symbol.for('HandleStripeWebhookUseCase'),
  HandlePayPalWebhook: Symbol.for('HandlePayPalWebhookUseCase'),

  // Guest access use cases
  GetGuestOrder: Symbol.for('GetGuestOrderUseCase'),
  GetGuestOrderKeys: Symbol.for('GetGuestOrderKeysUseCase'),
  RevealGuestKey: Symbol.for('RevealGuestKeyUseCase'),
  CreateGuestSupportTicket: Symbol.for('CreateGuestSupportTicketUseCase'),

  // Recommendation use cases
  GetSimilar: Symbol.for('GetSimilarUseCase'),
  GetAlsoViewed: Symbol.for('GetAlsoViewedUseCase'),
  GetBoughtTogether: Symbol.for('GetBoughtTogetherUseCase'),
  GetBatchRecommendations: Symbol.for('GetBatchRecommendationsUseCase'),
  GetPersonalized: Symbol.for('GetPersonalizedUseCase'),
  GetPopular: Symbol.for('GetPopularUseCase'),
  GetLatestReleases: Symbol.for('GetLatestReleasesUseCase'),
  GetPreOrders: Symbol.for('GetPreOrdersUseCase'),

  // Search use cases
  Search: Symbol.for('SearchUseCase'),
  MerchandisedSearch: Symbol.for('MerchandisedSearchUseCase'),

  // Additional use cases (architecture cleanup)
  ExchangeGuestSession: Symbol.for('ExchangeGuestSessionUseCase'),
  ConvertCartPrices: Symbol.for('ConvertCartPricesUseCase'),
  LogAccessAttempt: Symbol.for('LogAccessAttemptUseCase'),
} as const;
