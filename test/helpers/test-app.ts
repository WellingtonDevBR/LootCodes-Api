import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../src/di/tokens.js';
import { AuthService } from '../../src/core/services/auth/auth.service.js';
import { ProfileService } from '../../src/core/services/profile/profile.service.js';
import { OrderService } from '../../src/core/services/orders/order.service.js';
import { KeyDeliveryService } from '../../src/core/services/orders/key-delivery.service.js';
import { CheckoutService } from '../../src/core/services/checkout/checkout.service.js';
import { SupportService } from '../../src/core/services/support/support.service.js';
import { LibraryService } from '../../src/core/services/library/library.service.js';
import { NotificationService } from '../../src/core/services/notifications/notification.service.js';
import { ReviewService } from '../../src/core/services/reviews/review.service.js';
import { ProductService } from '../../src/core/services/products/product.service.js';
import { AnalyticsService } from '../../src/core/services/analytics/analytics.service.js';
import { WalletService } from '../../src/core/services/wallet/wallet.service.js';
import { ReferralService } from '../../src/core/services/referrals/referral.service.js';
import { NewsletterService } from '../../src/core/services/newsletter/newsletter.service.js';
import { SecurityService } from '../../src/core/services/security/security.service.js';
import { CardChallengeService } from '../../src/core/services/card-challenge/card-challenge.service.js';
import { PriceMatchService } from '../../src/core/services/price-match/price-match.service.js';
import { PaymentVerificationService } from '../../src/core/services/payments/payment-verification.service.js';
import { PaymentCaptureService } from '../../src/core/services/payments/payment-capture.service.js';
import { WebhookService } from '../../src/core/services/payments/webhook.service.js';
import { GuestAccessService } from '../../src/core/services/guest/guest-access.service.js';
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
  MockGuestSessionRepository,
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
  guestSessionRepo: MockGuestSessionRepository;
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
    guestSessionRepo: new MockGuestSessionRepository(),
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
  container.register(TOKENS.CheckoutRepository, { useValue: mocks.checkoutRepo });
  container.register(TOKENS.PromoCodeValidator, { useValue: mocks.promoCodeValidator });
  container.register(TOKENS.CartValidator, { useValue: mocks.cartValidator });

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

  // Services (real implementations, with mock dependencies)
  container.register(TOKENS.AuthService, { useClass: AuthService });
  container.register(TOKENS.ProfileService, { useClass: ProfileService });
  container.register(TOKENS.OrderService, { useClass: OrderService });
  container.register(TOKENS.KeyDeliveryService, { useClass: KeyDeliveryService });
  container.register(TOKENS.CheckoutService, { useClass: CheckoutService });
  container.register(TOKENS.SupportService, { useClass: SupportService });
  container.register(TOKENS.LibraryService, { useClass: LibraryService });
  container.register(TOKENS.NotificationService, { useClass: NotificationService });
  container.register(TOKENS.ReviewService, { useClass: ReviewService });
  container.register(TOKENS.ProductService, { useClass: ProductService });
  container.register(TOKENS.AnalyticsService, { useClass: AnalyticsService });
  container.register(TOKENS.WalletService, { useClass: WalletService });
  container.register(TOKENS.ReferralService, { useClass: ReferralService });
  container.register(TOKENS.NewsletterService, { useClass: NewsletterService });
  container.register(TOKENS.SecurityService, { useClass: SecurityService });
  container.register(TOKENS.CardChallengeService, { useClass: CardChallengeService });
  container.register(TOKENS.PriceMatchService, { useClass: PriceMatchService });
  container.register(TOKENS.PaymentVerificationService, { useClass: PaymentVerificationService });
  container.register(TOKENS.PaymentCaptureService, { useClass: PaymentCaptureService });
  container.register(TOKENS.WebhookService, { useClass: WebhookService });
  container.register(TOKENS.GuestAccessService, { useClass: GuestAccessService });

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
