import 'reflect-metadata';
import { container } from 'tsyringe';
import { loadEnv } from '../../src/config/env.js';
import { TOKENS, UC_TOKENS } from '../../src/di/tokens.js';
import { HandleAuthUseCase } from '../../src/core/use-cases/auth/handle-auth.use-case.js';
import { InitializeCheckoutUseCase } from '../../src/core/use-cases/checkout/initialize-checkout.use-case.js';
import { UpdateCheckoutUseCase } from '../../src/core/use-cases/checkout/update-checkout.use-case.js';
import { CancelCheckoutUseCase } from '../../src/core/use-cases/checkout/cancel-checkout.use-case.js';
import { CheckoutWithApprovalUseCase } from '../../src/core/use-cases/checkout/checkout-with-approval.use-case.js';
import { ValidatePromoCodeUseCase } from '../../src/core/use-cases/checkout/validate-promo-code.use-case.js';
import { GetPaymentMethodsConfigUseCase } from '../../src/core/use-cases/checkout/get-payment-methods-config.use-case.js';
import { CreateTicketUseCase } from '../../src/core/use-cases/support/create-ticket.use-case.js';
import { GetTicketUseCase } from '../../src/core/use-cases/support/get-ticket.use-case.js';
import { GetUserTicketsUseCase } from '../../src/core/use-cases/support/get-user-tickets.use-case.js';
import { AddMessageUseCase } from '../../src/core/use-cases/support/add-message.use-case.js';
import { UpdateStatusUseCase } from '../../src/core/use-cases/support/update-status.use-case.js';
import { SubmitFeedbackUseCase } from '../../src/core/use-cases/support/submit-feedback.use-case.js';
import { GetVerificationTicketsUseCase } from '../../src/core/use-cases/support/get-verification-tickets.use-case.js';
import { UploadAttachmentUseCase } from '../../src/core/use-cases/support/upload-attachment.use-case.js';
import { ListLibraryUseCase } from '../../src/core/use-cases/library/list-library.use-case.js';
import { SetLibraryStatusUseCase } from '../../src/core/use-cases/library/set-library-status.use-case.js';
import { RemoveFromLibraryUseCase } from '../../src/core/use-cases/library/remove-from-library.use-case.js';
import { UpdateLibraryEntryUseCase } from '../../src/core/use-cases/library/update-library-entry.use-case.js';

// Notification use cases
import { ListNotificationsUseCase } from '../../src/core/use-cases/notifications/list-notifications.use-case.js';
import { GetUnreadCountUseCase } from '../../src/core/use-cases/notifications/get-unread-count.use-case.js';
import { MarkReadUseCase } from '../../src/core/use-cases/notifications/mark-read.use-case.js';
import { MarkAllReadUseCase } from '../../src/core/use-cases/notifications/mark-all-read.use-case.js';
import { GetPreferencesUseCase } from '../../src/core/use-cases/notifications/get-preferences.use-case.js';
import { UpdatePreferencesUseCase } from '../../src/core/use-cases/notifications/update-preferences.use-case.js';
import { RegisterPushTokenUseCase } from '../../src/core/use-cases/notifications/register-push-token.use-case.js';
import { RemovePushTokenUseCase } from '../../src/core/use-cases/notifications/remove-push-token.use-case.js';

// Review use cases
import { GetProductReviewsUseCase } from '../../src/core/use-cases/reviews/get-product-reviews.use-case.js';
import { GetProductRatingUseCase } from '../../src/core/use-cases/reviews/get-product-rating.use-case.js';
import { SubmitReviewUseCase } from '../../src/core/use-cases/reviews/submit-review.use-case.js';
import { CheckEligibilityUseCase } from '../../src/core/use-cases/reviews/check-eligibility.use-case.js';

// Products use cases
import { GetProductBySlugUseCase } from '../../src/core/use-cases/products/catalog/get-product-by-slug.use-case.js';
import { GetProductByIdUseCase } from '../../src/core/use-cases/products/catalog/get-product-by-id.use-case.js';
import { GetVariantsUseCase } from '../../src/core/use-cases/products/catalog/get-variants.use-case.js';
import { GetGalleryUseCase } from '../../src/core/use-cases/products/catalog/get-gallery.use-case.js';
import { GetFeaturedUseCase } from '../../src/core/use-cases/products/catalog/get-featured.use-case.js';
import { CheckStockUseCase } from '../../src/core/use-cases/products/stock/check-stock.use-case.js';
import { BatchCheckStockUseCase } from '../../src/core/use-cases/products/stock/batch-check-stock.use-case.js';
import { SubscribeStockNotificationUseCase } from '../../src/core/use-cases/products/stock/subscribe-stock-notification.use-case.js';
import { UnsubscribeStockNotificationUseCase } from '../../src/core/use-cases/products/stock/unsubscribe-stock-notification.use-case.js';
import { IsSubscribedToStockUseCase } from '../../src/core/use-cases/products/stock/is-subscribed-to-stock.use-case.js';
import { IsVariantPurchasableUseCase } from '../../src/core/use-cases/products/stock/is-variant-purchasable.use-case.js';
import { GetPlatformsUseCase } from '../../src/core/use-cases/products/reference/get-platforms.use-case.js';
import { GetRegionsUseCase } from '../../src/core/use-cases/products/reference/get-regions.use-case.js';
import { GetGenresUseCase } from '../../src/core/use-cases/products/reference/get-genres.use-case.js';
import { GetFaqsUseCase } from '../../src/core/use-cases/products/reference/get-faqs.use-case.js';
import { GetPlatformBySlugUseCase } from '../../src/core/use-cases/products/reference/get-platform-by-slug.use-case.js';
import { GetPlatformNavItemsUseCase } from '../../src/core/use-cases/products/reference/get-platform-nav-items.use-case.js';
import { GetPlatformFamilyBySlugUseCase } from '../../src/core/use-cases/products/reference/get-platform-family-by-slug.use-case.js';
import { GetCategoriesUseCase } from '../../src/core/use-cases/products/categories/get-categories.use-case.js';
import { GetCategoryBySlugUseCase } from '../../src/core/use-cases/products/categories/get-category-by-slug.use-case.js';
import { GetSubcategoriesUseCase } from '../../src/core/use-cases/products/categories/get-subcategories.use-case.js';
import { GetCategoryFaqsUseCase } from '../../src/core/use-cases/products/categories/get-category-faqs.use-case.js';
import { GetLocalizedPriceUseCase } from '../../src/core/use-cases/products/pricing/get-localized-price.use-case.js';
import { GetBatchLocalizedPricesUseCase } from '../../src/core/use-cases/products/pricing/get-batch-localized-prices.use-case.js';
import { HasPricesForCurrencyUseCase } from '../../src/core/use-cases/products/pricing/has-prices-for-currency.use-case.js';
import { SyncCurrencyRatesUseCase } from '../../src/core/use-cases/products/pricing/sync-currency-rates.use-case.js';
import { ConvertCartPricesUseCase } from '../../src/core/use-cases/products/pricing/convert-cart-prices.use-case.js';
import { IsCountryAllowedUseCase } from '../../src/core/use-cases/products/geo/is-country-allowed.use-case.js';
import { GetExcludedCountriesUseCase } from '../../src/core/use-cases/products/geo/get-excluded-countries.use-case.js';
import { GetRestrictedVariantsUseCase } from '../../src/core/use-cases/products/geo/get-restricted-variants.use-case.js';
import { GetRestrictedRegionsUseCase } from '../../src/core/use-cases/products/geo/get-restricted-regions.use-case.js';
import { GetActivePromoHeaderUseCase } from '../../src/core/use-cases/products/storefront/get-active-promo-header.use-case.js';
import { GetTrustpilotDataUseCase } from '../../src/core/use-cases/products/storefront/get-trustpilot-data.use-case.js';

// Payment use cases
import { VerifyAndFulfillUseCase } from '../../src/core/use-cases/payments/verify-and-fulfill.use-case.js';
import { CapturePaymentUseCase } from '../../src/core/use-cases/payments/capture-payment.use-case.js';

// Webhook use cases
import { HandleStripeWebhookUseCase } from '../../src/core/use-cases/webhooks/handle-stripe-webhook.use-case.js';
import { HandlePayPalWebhookUseCase } from '../../src/core/use-cases/webhooks/handle-paypal-webhook.use-case.js';

// Guest use cases
import { ExchangeGuestSessionUseCase } from '../../src/core/use-cases/guest/exchange-guest-session.use-case.js';
import { GetGuestOrderUseCase } from '../../src/core/use-cases/guest/get-guest-order.use-case.js';
import { GetGuestOrderKeysUseCase } from '../../src/core/use-cases/guest/get-guest-order-keys.use-case.js';
import { RevealGuestKeyUseCase } from '../../src/core/use-cases/guest/reveal-guest-key.use-case.js';
import { CreateGuestSupportTicketUseCase } from '../../src/core/use-cases/guest/create-guest-support-ticket.use-case.js';

// Analytics use cases
import { GeolocateUseCase } from '../../src/core/use-cases/analytics/geolocate.use-case.js';
import { TrackBatchUseCase } from '../../src/core/use-cases/analytics/track-batch.use-case.js';
import { TrackCartEventUseCase } from '../../src/core/use-cases/analytics/track-cart-event.use-case.js';
import { UpdateSessionOutcomeUseCase } from '../../src/core/use-cases/analytics/update-session-outcome.use-case.js';
import { TrackProductViewDurationUseCase } from '../../src/core/use-cases/analytics/track-product-view-duration.use-case.js';
import { TrackSearchEventUseCase } from '../../src/core/use-cases/analytics/track-search-event.use-case.js';

// Wallet use cases
import { GetBalanceUseCase } from '../../src/core/use-cases/wallet/get-balance.use-case.js';
import { ListLedgerUseCase } from '../../src/core/use-cases/wallet/list-ledger.use-case.js';
import { GetOrderEarningsUseCase } from '../../src/core/use-cases/wallet/get-order-earnings.use-case.js';
import { ClaimReviewRewardUseCase } from '../../src/core/use-cases/wallet/claim-review-reward.use-case.js';

// Newsletter use cases
import { SubscribeUseCase } from '../../src/core/use-cases/newsletter/subscribe.use-case.js';
import { ConfirmUseCase } from '../../src/core/use-cases/newsletter/confirm.use-case.js';
import { UnsubscribeUseCase as NewsletterUnsubscribeUseCase } from '../../src/core/use-cases/newsletter/unsubscribe.use-case.js';

// Referral use cases
import { GetReferralMeUseCase } from '../../src/core/use-cases/referrals/get-referral-me.use-case.js';
import { ListReferralsUseCase } from '../../src/core/use-cases/referrals/list-referrals.use-case.js';
import { GetLeaderboardUseCase } from '../../src/core/use-cases/referrals/get-leaderboard.use-case.js';

// Recommendation use cases
import { GetSimilarUseCase } from '../../src/core/use-cases/recommendations/get-similar.use-case.js';
import { GetAlsoViewedUseCase } from '../../src/core/use-cases/recommendations/get-also-viewed.use-case.js';
import { GetBoughtTogetherUseCase } from '../../src/core/use-cases/recommendations/get-bought-together.use-case.js';
import { GetBatchRecommendationsUseCase } from '../../src/core/use-cases/recommendations/get-batch-recommendations.use-case.js';
import { GetPersonalizedUseCase } from '../../src/core/use-cases/recommendations/get-personalized.use-case.js';
import { GetPopularUseCase } from '../../src/core/use-cases/recommendations/get-popular.use-case.js';
import { GetLatestReleasesUseCase } from '../../src/core/use-cases/recommendations/get-latest-releases.use-case.js';
import { GetPreOrdersUseCase } from '../../src/core/use-cases/recommendations/get-pre-orders.use-case.js';

// Search use cases
import { SearchUseCase } from '../../src/core/use-cases/search/search.use-case.js';
import { MerchandisedSearchUseCase } from '../../src/core/use-cases/search/merchandised-search.use-case.js';

// Security use cases
import { GetHoldUseCase } from '../../src/core/use-cases/security/get-hold.use-case.js';
import { GetHoldStatusUseCase } from '../../src/core/use-cases/security/get-hold-status.use-case.js';
import { UploadDocumentUseCase } from '../../src/core/use-cases/security/upload-document.use-case.js';
import { SubmitResponseUseCase } from '../../src/core/use-cases/security/submit-response.use-case.js';
import { UnlockAccountUseCase } from '../../src/core/use-cases/security/unlock-account.use-case.js';

// Card challenge use cases
import { StartChallengeUseCase } from '../../src/core/use-cases/card-challenge/start-challenge.use-case.js';
import { VerifyChallengeUseCase } from '../../src/core/use-cases/card-challenge/verify-challenge.use-case.js';
import { ChooseIdUseCase } from '../../src/core/use-cases/card-challenge/choose-id.use-case.js';

// Price match use cases
import { SubmitClaimUseCase } from '../../src/core/use-cases/price-match/submit-claim.use-case.js';
import { GetUserClaimsUseCase } from '../../src/core/use-cases/price-match/get-user-claims.use-case.js';
import { GetConfigUseCase } from '../../src/core/use-cases/price-match/get-config.use-case.js';
import { GetClaimPromoCodeUseCase } from '../../src/core/use-cases/price-match/get-claim-promo-code.use-case.js';

// Order use cases (additional)
import { LogAccessAttemptUseCase } from '../../src/core/use-cases/orders/log-access-attempt.use-case.js';

// Order use cases
import { GetOrderUseCase } from '../../src/core/use-cases/orders/get-order.use-case.js';
import { GetOrderDetailUseCase } from '../../src/core/use-cases/orders/get-order-detail.use-case.js';
import { GetUserOrdersUseCase } from '../../src/core/use-cases/orders/get-user-orders.use-case.js';
import { GetUserOrdersForSupportUseCase } from '../../src/core/use-cases/orders/get-user-orders-for-support.use-case.js';
import { ValidateAccessTokenUseCase } from '../../src/core/use-cases/orders/validate-access-token.use-case.js';
import { ClaimGuestOrderUseCase } from '../../src/core/use-cases/orders/claim-guest-order.use-case.js';
import { GetOrderVerificationTicketUseCase } from '../../src/core/use-cases/orders/get-order-verification-ticket.use-case.js';

// Key delivery use cases
import { GetKeysForOrderUseCase } from '../../src/core/use-cases/key-delivery/get-keys-for-order.use-case.js';
import { GetKeysForOrderItemUseCase } from '../../src/core/use-cases/key-delivery/get-keys-for-order-item.use-case.js';
import { RevealKeyUseCase } from '../../src/core/use-cases/key-delivery/reveal-key.use-case.js';
import { CheckKeyViewedUseCase } from '../../src/core/use-cases/key-delivery/check-key-viewed.use-case.js';
import {
  MockDatabase,
  MockAuthProvider,
  MockEmailSender,
  MockEventBus,
  MockRecaptchaVerifier,
  MockUserRepository,
  MockRateLimiter,
  MockIpBlocklist,
  MockUserProfileRepository,
  MockAvatarStorage,
  MockSessionRepository,
  MockOrderRepository,
  MockProductKeyRepository,
  MockOrderAccessTokenRepository,
  MockPaymentGateway,
  MockPaymentProvider,
  MockCheckoutRepository,
  MockPromoCodeValidator,
  MockCartValidator,
  MockSupportTicketRepository,
  MockAttachmentStorage,
  MockUserLibraryRepository,
  MockNotificationRepository,
  MockNotificationPreferencesRepository,
  MockPushTokenRepository,
  MockReviewRepository,
  MockProductRepository,
  MockReferenceDataRepository,
  MockStockNotificationRepository,
  MockAnalyticsRepository,
  MockGeoService,
  MockWalletRepository,
  MockReferralRepository,
  MockNewsletterRepository,
  MockSecurityHoldRepository,
  MockVerificationStorage,
  MockCardChallengeRepository,
  MockMicroAuthProvider,
  MockPriceMatchRepository,
  MockPaymentVerifier,
  MockRiskAssessor,
  MockFulfillmentService,
  MockPaymentCapturer,
  MockWebhookVerifier,
  MockWebhookHandler,
  MockVerificationCodeService,
  MockGuestSessionRepository,
  MockCategoryRepository,
  MockPricingRepository,
  MockGeoRestrictionRepository,
  MockRecommendationRepository,
  MockSearchProvider,
  MockCustomerResolver,
  MockPaymentProviderFactory,
  MockPaymentCapturerFactory,
  MockPaymentVerifierFactory,
} from './mock-ports.js';

export interface TestMocks {
  db: MockDatabase;
  auth: MockAuthProvider;
  email: MockEmailSender;
  eventBus: MockEventBus;
  recaptcha: MockRecaptchaVerifier;
  userRepo: MockUserRepository;
  rateLimiter: MockRateLimiter;
  ipBlocklist: MockIpBlocklist;
  userProfileRepo: MockUserProfileRepository;
  avatarStorage: MockAvatarStorage;
  sessionRepo: MockSessionRepository;
  orderRepo: MockOrderRepository;
  productKeyRepo: MockProductKeyRepository;
  orderAccessTokenRepo: MockOrderAccessTokenRepository;
  paymentGateway: MockPaymentGateway;
  paymentProvider: MockPaymentProvider;
  checkoutRepo: MockCheckoutRepository;
  promoCodeValidator: MockPromoCodeValidator;
  cartValidator: MockCartValidator;
  supportTicketRepo: MockSupportTicketRepository;
  attachmentStorage: MockAttachmentStorage;
  libraryRepo: MockUserLibraryRepository;
  notificationRepo: MockNotificationRepository;
  notificationPrefsRepo: MockNotificationPreferencesRepository;
  pushTokenRepo: MockPushTokenRepository;
  reviewRepo: MockReviewRepository;
  productRepo: MockProductRepository;
  referenceDataRepo: MockReferenceDataRepository;
  stockNotificationRepo: MockStockNotificationRepository;
  analyticsRepo: MockAnalyticsRepository;
  geoService: MockGeoService;
  walletRepo: MockWalletRepository;
  referralRepo: MockReferralRepository;
  newsletterRepo: MockNewsletterRepository;
  securityHoldRepo: MockSecurityHoldRepository;
  verificationStorage: MockVerificationStorage;
  cardChallengeRepo: MockCardChallengeRepository;
  microAuthProvider: MockMicroAuthProvider;
  priceMatchRepo: MockPriceMatchRepository;
  paymentVerifier: MockPaymentVerifier;
  riskAssessor: MockRiskAssessor;
  fulfillmentService: MockFulfillmentService;
  paymentCapturer: MockPaymentCapturer;
  webhookVerifier: MockWebhookVerifier;
  webhookHandler: MockWebhookHandler;
  verificationCode: MockVerificationCodeService;
  guestSessionRepo: MockGuestSessionRepository;
  categoryRepo: MockCategoryRepository;
  pricingRepo: MockPricingRepository;
  geoRestrictionRepo: MockGeoRestrictionRepository;
  recommendationRepo: MockRecommendationRepository;
  searchProvider: MockSearchProvider;
  customerResolver: MockCustomerResolver;
  paymentProviderFactory: MockPaymentProviderFactory;
  paymentCapturerFactory: MockPaymentCapturerFactory;
  paymentVerifierFactory: MockPaymentVerifierFactory;
}

function setTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.INTERNAL_SERVICE_SECRET = 'test-internal-secret';
  process.env.RECAPTCHA_PROJECT_ID = 'test-project';
  process.env.RECAPTCHA_SITE_KEY = 'test-site-key';
  process.env.RECAPTCHA_API_KEY = 'test-api-key';
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.SITE_URL = 'https://test.lootcodes.com';
  loadEnv();
}

function registerMocks(): TestMocks {
  const mocks: TestMocks = {
    db: new MockDatabase(),
    auth: new MockAuthProvider(),
    email: new MockEmailSender(),
    eventBus: new MockEventBus(),
    recaptcha: new MockRecaptchaVerifier(),
    userRepo: new MockUserRepository(),
    rateLimiter: new MockRateLimiter(),
    ipBlocklist: new MockIpBlocklist(),
    userProfileRepo: new MockUserProfileRepository(),
    avatarStorage: new MockAvatarStorage(),
    sessionRepo: new MockSessionRepository(),
    orderRepo: new MockOrderRepository(),
    productKeyRepo: new MockProductKeyRepository(),
    orderAccessTokenRepo: new MockOrderAccessTokenRepository(),
    paymentGateway: new MockPaymentGateway(),
    paymentProvider: new MockPaymentProvider(),
    checkoutRepo: new MockCheckoutRepository(),
    promoCodeValidator: new MockPromoCodeValidator(),
    cartValidator: new MockCartValidator(),
    supportTicketRepo: new MockSupportTicketRepository(),
    attachmentStorage: new MockAttachmentStorage(),
    libraryRepo: new MockUserLibraryRepository(),
    notificationRepo: new MockNotificationRepository(),
    notificationPrefsRepo: new MockNotificationPreferencesRepository(),
    pushTokenRepo: new MockPushTokenRepository(),
    reviewRepo: new MockReviewRepository(),
    productRepo: new MockProductRepository(),
    referenceDataRepo: new MockReferenceDataRepository(),
    stockNotificationRepo: new MockStockNotificationRepository(),
    analyticsRepo: new MockAnalyticsRepository(),
    geoService: new MockGeoService(),
    walletRepo: new MockWalletRepository(),
    referralRepo: new MockReferralRepository(),
    newsletterRepo: new MockNewsletterRepository(),
    securityHoldRepo: new MockSecurityHoldRepository(),
    verificationStorage: new MockVerificationStorage(),
    cardChallengeRepo: new MockCardChallengeRepository(),
    microAuthProvider: new MockMicroAuthProvider(),
    priceMatchRepo: new MockPriceMatchRepository(),
    paymentVerifier: new MockPaymentVerifier(),
    riskAssessor: new MockRiskAssessor(),
    fulfillmentService: new MockFulfillmentService(),
    paymentCapturer: new MockPaymentCapturer(),
    webhookVerifier: new MockWebhookVerifier(),
    webhookHandler: new MockWebhookHandler(),
    verificationCode: new MockVerificationCodeService(),
    guestSessionRepo: new MockGuestSessionRepository(),
    categoryRepo: new MockCategoryRepository(),
    pricingRepo: new MockPricingRepository(),
    geoRestrictionRepo: new MockGeoRestrictionRepository(),
    recommendationRepo: new MockRecommendationRepository(),
    searchProvider: new MockSearchProvider(),
    customerResolver: new MockCustomerResolver(),
    paymentProviderFactory: new MockPaymentProviderFactory(),
    paymentCapturerFactory: new MockPaymentCapturerFactory(),
    paymentVerifierFactory: new MockPaymentVerifierFactory(),
  };

  // Infrastructure
  container.register(TOKENS.Database, { useValue: mocks.db });
  container.register(TOKENS.AuthProvider, { useValue: mocks.auth });
  container.register(TOKENS.EmailSender, { useValue: mocks.email });
  container.register(TOKENS.EventBus, { useValue: mocks.eventBus });
  container.register(TOKENS.RecaptchaVerifier, { useValue: mocks.recaptcha });
  container.register(TOKENS.UserRepository, { useValue: mocks.userRepo });
  container.register(TOKENS.RateLimiter, { useValue: mocks.rateLimiter });
  container.register(TOKENS.IpBlocklist, { useValue: mocks.ipBlocklist });

  // Profile
  container.register(TOKENS.UserProfileRepository, { useValue: mocks.userProfileRepo });
  container.register(TOKENS.AvatarStorage, { useValue: mocks.avatarStorage });
  container.register(TOKENS.SessionRepository, { useValue: mocks.sessionRepo });

  // Orders
  container.register(TOKENS.OrderRepository, { useValue: mocks.orderRepo });
  container.register(TOKENS.ProductKeyRepository, { useValue: mocks.productKeyRepo });
  container.register(TOKENS.OrderAccessTokenRepository, { useValue: mocks.orderAccessTokenRepo });
  container.register(TOKENS.PaymentGateway, { useValue: mocks.paymentGateway });

  // Checkout
  container.register(TOKENS.PaymentProvider, { useValue: mocks.paymentProvider });
  container.register(TOKENS.PaymentProviderFactory, { useValue: mocks.paymentProviderFactory });
  container.register(TOKENS.PaymentCapturerFactory, { useValue: mocks.paymentCapturerFactory });
  container.register(TOKENS.PaymentVerifierFactory, { useValue: mocks.paymentVerifierFactory });
  container.register(TOKENS.CheckoutRepository, { useValue: mocks.checkoutRepo });
  container.register(TOKENS.PromoCodeValidator, { useValue: mocks.promoCodeValidator });
  container.register(TOKENS.CartValidator, { useValue: mocks.cartValidator });
  container.register(TOKENS.CustomerResolver, { useValue: mocks.customerResolver });

  // Support
  container.register(TOKENS.SupportTicketRepository, { useValue: mocks.supportTicketRepo });
  container.register(TOKENS.AttachmentStorage, { useValue: mocks.attachmentStorage });

  // Library
  container.register(TOKENS.UserLibraryRepository, { useValue: mocks.libraryRepo });

  // Notifications
  container.register(TOKENS.NotificationRepository, { useValue: mocks.notificationRepo });
  container.register(TOKENS.NotificationPreferencesRepository, { useValue: mocks.notificationPrefsRepo });
  container.register(TOKENS.PushTokenRepository, { useValue: mocks.pushTokenRepo });

  // Reviews
  container.register(TOKENS.ReviewRepository, { useValue: mocks.reviewRepo });

  // Products
  container.register(TOKENS.ProductRepository, { useValue: mocks.productRepo });
  container.register(TOKENS.ReferenceDataRepository, { useValue: mocks.referenceDataRepo });
  container.register(TOKENS.StockNotificationRepository, { useValue: mocks.stockNotificationRepo });

  // Analytics
  container.register(TOKENS.AnalyticsRepository, { useValue: mocks.analyticsRepo });
  container.register(TOKENS.GeoService, { useValue: mocks.geoService });

  // Wallet
  container.register(TOKENS.WalletRepository, { useValue: mocks.walletRepo });

  // Referrals
  container.register(TOKENS.ReferralRepository, { useValue: mocks.referralRepo });

  // Newsletter
  container.register(TOKENS.NewsletterRepository, { useValue: mocks.newsletterRepo });

  // Security
  container.register(TOKENS.SecurityHoldRepository, { useValue: mocks.securityHoldRepo });
  container.register(TOKENS.VerificationStorage, { useValue: mocks.verificationStorage });
  container.register(TOKENS.VerificationCodeService, { useValue: mocks.verificationCode });

  // Card Challenge
  container.register(TOKENS.CardChallengeRepository, { useValue: mocks.cardChallengeRepo });
  container.register(TOKENS.MicroAuthProvider, { useValue: mocks.microAuthProvider });

  // Price Match
  container.register(TOKENS.PriceMatchRepository, { useValue: mocks.priceMatchRepo });

  // Payment Verification + Capture
  container.register(TOKENS.PaymentVerifier, { useValue: mocks.paymentVerifier });
  container.register(TOKENS.RiskAssessor, { useValue: mocks.riskAssessor });
  container.register(TOKENS.FulfillmentService, { useValue: mocks.fulfillmentService });
  container.register(TOKENS.PaymentCapturer, { useValue: mocks.paymentCapturer });

  // Webhooks
  container.register(TOKENS.WebhookVerifier, { useValue: mocks.webhookVerifier });
  container.register(TOKENS.WebhookHandler, { useValue: mocks.webhookHandler });

  // Guest
  container.register(TOKENS.GuestSessionRepository, { useValue: mocks.guestSessionRepo });

  // Categories + Pricing + Geo + Recommendations + Search
  container.register(TOKENS.CategoryRepository, { useValue: mocks.categoryRepo });
  container.register(TOKENS.PricingRepository, { useValue: mocks.pricingRepo });
  container.register(TOKENS.GeoRestrictionRepository, { useValue: mocks.geoRestrictionRepo });
  container.register(TOKENS.RecommendationRepository, { useValue: mocks.recommendationRepo });
  container.register(TOKENS.SearchProvider, { useValue: mocks.searchProvider });

  // Order use cases (real implementations, with mock dependencies)
  container.register(UC_TOKENS.GetOrder, { useClass: GetOrderUseCase });
  container.register(UC_TOKENS.GetOrderDetail, { useClass: GetOrderDetailUseCase });
  container.register(UC_TOKENS.GetUserOrders, { useClass: GetUserOrdersUseCase });
  container.register(UC_TOKENS.GetUserOrdersForSupport, { useClass: GetUserOrdersForSupportUseCase });
  container.register(UC_TOKENS.ValidateAccessToken, { useClass: ValidateAccessTokenUseCase });
  container.register(UC_TOKENS.ClaimGuestOrder, { useClass: ClaimGuestOrderUseCase });
  container.register(UC_TOKENS.GetOrderVerificationTicket, { useClass: GetOrderVerificationTicketUseCase });

  // Key delivery use cases
  container.register(UC_TOKENS.GetKeysForOrder, { useClass: GetKeysForOrderUseCase });
  container.register(UC_TOKENS.GetKeysForOrderItem, { useClass: GetKeysForOrderItemUseCase });
  container.register(UC_TOKENS.RevealKey, { useClass: RevealKeyUseCase });
  container.register(UC_TOKENS.CheckKeyViewed, { useClass: CheckKeyViewedUseCase });

  // Support use cases
  container.register(UC_TOKENS.CreateTicket, { useClass: CreateTicketUseCase });
  container.register(UC_TOKENS.GetTicket, { useClass: GetTicketUseCase });
  container.register(UC_TOKENS.GetUserTickets, { useClass: GetUserTicketsUseCase });
  container.register(UC_TOKENS.AddMessage, { useClass: AddMessageUseCase });
  container.register(UC_TOKENS.UpdateTicketStatus, { useClass: UpdateStatusUseCase });
  container.register(UC_TOKENS.SubmitFeedback, { useClass: SubmitFeedbackUseCase });
  container.register(UC_TOKENS.GetVerificationTickets, { useClass: GetVerificationTicketsUseCase });
  container.register(UC_TOKENS.UploadAttachment, { useClass: UploadAttachmentUseCase });

  // Library use cases
  container.register(UC_TOKENS.ListLibrary, { useClass: ListLibraryUseCase });
  container.register(UC_TOKENS.SetLibraryStatus, { useClass: SetLibraryStatusUseCase });
  container.register(UC_TOKENS.RemoveFromLibrary, { useClass: RemoveFromLibraryUseCase });
  container.register(UC_TOKENS.UpdateLibraryEntry, { useClass: UpdateLibraryEntryUseCase });

  // Auth use cases
  container.register(UC_TOKENS.HandleAuth, { useClass: HandleAuthUseCase });

  // Checkout use cases
  container.register(UC_TOKENS.InitializeCheckout, { useClass: InitializeCheckoutUseCase });
  container.register(UC_TOKENS.UpdateCheckout, { useClass: UpdateCheckoutUseCase });
  container.register(UC_TOKENS.CancelCheckout, { useClass: CancelCheckoutUseCase });
  container.register(UC_TOKENS.CheckoutWithApproval, { useClass: CheckoutWithApprovalUseCase });
  container.register(UC_TOKENS.ValidatePromoCode, { useClass: ValidatePromoCodeUseCase });
  container.register(UC_TOKENS.GetPaymentMethodsConfig, { useClass: GetPaymentMethodsConfigUseCase });

  // Notification use cases
  container.register(UC_TOKENS.ListNotifications, { useClass: ListNotificationsUseCase });
  container.register(UC_TOKENS.GetUnreadCount, { useClass: GetUnreadCountUseCase });
  container.register(UC_TOKENS.MarkRead, { useClass: MarkReadUseCase });
  container.register(UC_TOKENS.MarkAllRead, { useClass: MarkAllReadUseCase });
  container.register(UC_TOKENS.GetPreferences, { useClass: GetPreferencesUseCase });
  container.register(UC_TOKENS.UpdatePreferences, { useClass: UpdatePreferencesUseCase });
  container.register(UC_TOKENS.RegisterPushToken, { useClass: RegisterPushTokenUseCase });
  container.register(UC_TOKENS.RemovePushToken, { useClass: RemovePushTokenUseCase });

  // Review use cases
  container.register(UC_TOKENS.GetProductReviews, { useClass: GetProductReviewsUseCase });
  container.register(UC_TOKENS.GetProductRating, { useClass: GetProductRatingUseCase });
  container.register(UC_TOKENS.SubmitReview, { useClass: SubmitReviewUseCase });
  container.register(UC_TOKENS.CheckEligibility, { useClass: CheckEligibilityUseCase });

  // Products use cases
  container.register(UC_TOKENS.GetProductBySlug, { useClass: GetProductBySlugUseCase });
  container.register(UC_TOKENS.GetProductById, { useClass: GetProductByIdUseCase });
  container.register(UC_TOKENS.GetVariants, { useClass: GetVariantsUseCase });
  container.register(UC_TOKENS.GetGallery, { useClass: GetGalleryUseCase });
  container.register(UC_TOKENS.GetFeatured, { useClass: GetFeaturedUseCase });
  container.register(UC_TOKENS.CheckStock, { useClass: CheckStockUseCase });
  container.register(UC_TOKENS.BatchCheckStock, { useClass: BatchCheckStockUseCase });
  container.register(UC_TOKENS.SubscribeStockNotification, { useClass: SubscribeStockNotificationUseCase });
  container.register(UC_TOKENS.UnsubscribeStockNotification, { useClass: UnsubscribeStockNotificationUseCase });
  container.register(UC_TOKENS.IsSubscribedToStock, { useClass: IsSubscribedToStockUseCase });
  container.register(UC_TOKENS.IsVariantPurchasable, { useClass: IsVariantPurchasableUseCase });
  container.register(UC_TOKENS.GetPlatforms, { useClass: GetPlatformsUseCase });
  container.register(UC_TOKENS.GetRegions, { useClass: GetRegionsUseCase });
  container.register(UC_TOKENS.GetGenres, { useClass: GetGenresUseCase });
  container.register(UC_TOKENS.GetFaqs, { useClass: GetFaqsUseCase });
  container.register(UC_TOKENS.GetPlatformBySlug, { useClass: GetPlatformBySlugUseCase });
  container.register(UC_TOKENS.GetPlatformNavItems, { useClass: GetPlatformNavItemsUseCase });
  container.register(UC_TOKENS.GetPlatformFamilyBySlug, { useClass: GetPlatformFamilyBySlugUseCase });
  container.register(UC_TOKENS.GetCategories, { useClass: GetCategoriesUseCase });
  container.register(UC_TOKENS.GetCategoryBySlug, { useClass: GetCategoryBySlugUseCase });
  container.register(UC_TOKENS.GetSubcategories, { useClass: GetSubcategoriesUseCase });
  container.register(UC_TOKENS.GetCategoryFaqs, { useClass: GetCategoryFaqsUseCase });
  container.register(UC_TOKENS.GetLocalizedPrice, { useClass: GetLocalizedPriceUseCase });
  container.register(UC_TOKENS.GetBatchLocalizedPrices, { useClass: GetBatchLocalizedPricesUseCase });
  container.register(UC_TOKENS.HasPricesForCurrency, { useClass: HasPricesForCurrencyUseCase });
  container.register(UC_TOKENS.SyncCurrencyRates, { useClass: SyncCurrencyRatesUseCase });
  container.register(UC_TOKENS.IsCountryAllowed, { useClass: IsCountryAllowedUseCase });
  container.register(UC_TOKENS.GetExcludedCountries, { useClass: GetExcludedCountriesUseCase });
  container.register(UC_TOKENS.GetRestrictedVariants, { useClass: GetRestrictedVariantsUseCase });
  container.register(UC_TOKENS.GetRestrictedRegions, { useClass: GetRestrictedRegionsUseCase });
  container.register(UC_TOKENS.GetActivePromoHeader, { useClass: GetActivePromoHeaderUseCase });
  container.register(UC_TOKENS.GetTrustpilotData, { useClass: GetTrustpilotDataUseCase });

  // Analytics use cases
  container.register(UC_TOKENS.Geolocate, { useClass: GeolocateUseCase });
  container.register(UC_TOKENS.TrackBatch, { useClass: TrackBatchUseCase });
  container.register(UC_TOKENS.TrackCartEvent, { useClass: TrackCartEventUseCase });
  container.register(UC_TOKENS.UpdateSessionOutcome, { useClass: UpdateSessionOutcomeUseCase });
  container.register(UC_TOKENS.TrackProductViewDuration, { useClass: TrackProductViewDurationUseCase });
  container.register(UC_TOKENS.TrackSearchEvent, { useClass: TrackSearchEventUseCase });

  // Wallet use cases
  container.register(UC_TOKENS.GetBalance, { useClass: GetBalanceUseCase });
  container.register(UC_TOKENS.ListLedger, { useClass: ListLedgerUseCase });
  container.register(UC_TOKENS.GetOrderEarnings, { useClass: GetOrderEarningsUseCase });
  container.register(UC_TOKENS.ClaimReviewReward, { useClass: ClaimReviewRewardUseCase });

  // Payment use cases
  container.register(UC_TOKENS.VerifyAndFulfill, { useClass: VerifyAndFulfillUseCase });
  container.register(UC_TOKENS.CapturePayment, { useClass: CapturePaymentUseCase });

  // Webhook use cases
  container.register(UC_TOKENS.HandleStripeWebhook, { useClass: HandleStripeWebhookUseCase });
  container.register(UC_TOKENS.HandlePayPalWebhook, { useClass: HandlePayPalWebhookUseCase });

  // Guest use cases
  container.register(UC_TOKENS.ExchangeGuestSession, { useClass: ExchangeGuestSessionUseCase });
  container.register(UC_TOKENS.GetGuestOrder, { useClass: GetGuestOrderUseCase });
  container.register(UC_TOKENS.GetGuestOrderKeys, { useClass: GetGuestOrderKeysUseCase });
  container.register(UC_TOKENS.RevealGuestKey, { useClass: RevealGuestKeyUseCase });
  container.register(UC_TOKENS.CreateGuestSupportTicket, { useClass: CreateGuestSupportTicketUseCase });

  // Newsletter use cases
  container.register(UC_TOKENS.Subscribe, { useClass: SubscribeUseCase });
  container.register(UC_TOKENS.Confirm, { useClass: ConfirmUseCase });
  container.register(UC_TOKENS.Unsubscribe, { useClass: NewsletterUnsubscribeUseCase });

  // Referral use cases
  container.register(UC_TOKENS.GetReferralMe, { useClass: GetReferralMeUseCase });
  container.register(UC_TOKENS.ListReferrals, { useClass: ListReferralsUseCase });
  container.register(UC_TOKENS.GetLeaderboard, { useClass: GetLeaderboardUseCase });

  // Recommendation use cases
  container.register(UC_TOKENS.GetSimilar, { useClass: GetSimilarUseCase });
  container.register(UC_TOKENS.GetAlsoViewed, { useClass: GetAlsoViewedUseCase });
  container.register(UC_TOKENS.GetBoughtTogether, { useClass: GetBoughtTogetherUseCase });
  container.register(UC_TOKENS.GetBatchRecommendations, { useClass: GetBatchRecommendationsUseCase });
  container.register(UC_TOKENS.GetPersonalized, { useClass: GetPersonalizedUseCase });
  container.register(UC_TOKENS.GetPopular, { useClass: GetPopularUseCase });
  container.register(UC_TOKENS.GetLatestReleases, { useClass: GetLatestReleasesUseCase });
  container.register(UC_TOKENS.GetPreOrders, { useClass: GetPreOrdersUseCase });

  // Search use cases
  container.register(UC_TOKENS.Search, { useClass: SearchUseCase });
  container.register(UC_TOKENS.MerchandisedSearch, { useClass: MerchandisedSearchUseCase });

  // Security use cases
  container.register(UC_TOKENS.GetHold, { useClass: GetHoldUseCase });
  container.register(UC_TOKENS.GetHoldStatus, { useClass: GetHoldStatusUseCase });
  container.register(UC_TOKENS.UploadDocument, { useClass: UploadDocumentUseCase });
  container.register(UC_TOKENS.SubmitHoldResponse, { useClass: SubmitResponseUseCase });
  container.register(UC_TOKENS.UnlockAccount, { useClass: UnlockAccountUseCase });

  // Card challenge use cases
  container.register(UC_TOKENS.StartChallenge, { useClass: StartChallengeUseCase });
  container.register(UC_TOKENS.VerifyChallenge, { useClass: VerifyChallengeUseCase });
  container.register(UC_TOKENS.ChooseId, { useClass: ChooseIdUseCase });

  // Price match use cases
  container.register(UC_TOKENS.SubmitClaim, { useClass: SubmitClaimUseCase });
  container.register(UC_TOKENS.GetUserClaims, { useClass: GetUserClaimsUseCase });
  container.register(UC_TOKENS.GetPriceMatchConfig, { useClass: GetConfigUseCase });
  container.register(UC_TOKENS.GetClaimPromoCode, { useClass: GetClaimPromoCodeUseCase });

  // Products — pricing (additional)
  container.register(UC_TOKENS.ConvertCartPrices, { useClass: ConvertCartPricesUseCase });

  // Orders (additional)
  container.register(UC_TOKENS.LogAccessAttempt, { useClass: LogAccessAttemptUseCase });

  return mocks;
}

export function setupTestContainer(): TestMocks {
  setTestEnv();
  return registerMocks();
}

export async function buildTestApp() {
  setTestEnv();

  const { buildApp } = await import('../../src/app.js');
  const app = await buildApp();

  const mocks = registerMocks();

  return { app, mocks };
}
