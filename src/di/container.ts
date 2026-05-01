import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from './tokens.js';

// Infrastructure adapters
import { SupabaseDbAdapter } from '../infra/database/supabase-db.adapter.js';
import { SupabaseAuthAdapter } from '../infra/auth/supabase-auth.adapter.js';
import { ResendEmailAdapter } from '../infra/email/resend.adapter.js';
import { InProcessEventBusAdapter } from '../infra/event-bus/in-process-event-bus.adapter.js';
import { RecaptchaAdapter } from '../infra/recaptcha/recaptcha.adapter.js';
import { SupabaseUserRepository } from '../infra/user/supabase-user.repository.js';
import { SupabaseRateLimiterAdapter } from '../infra/security/supabase-rate-limiter.adapter.js';
import { SupabaseIpBlocklistAdapter } from '../infra/security/supabase-ip-blocklist.adapter.js';

// Profile adapters
import { SupabaseUserProfileRepository } from '../infra/profile/supabase-user-profile.repository.js';
import { SupabaseAvatarStorageAdapter } from '../infra/profile/supabase-avatar-storage.adapter.js';
import { SupabaseSessionRepository } from '../infra/profile/supabase-session.repository.js';

// Order adapters
import { SupabaseOrderRepository } from '../infra/orders/supabase-order.repository.js';
import { SupabaseProductKeyRepository } from '../infra/orders/supabase-product-key.repository.js';
import { SupabaseOrderAccessTokenRepository } from '../infra/orders/supabase-order-access-token.repository.js';
import { StripePaymentGatewayAdapter } from '../infra/payments/stripe-payment-gateway.adapter.js';

// Checkout adapters
import { StripePaymentAdapter } from '../infra/payments/stripe-payment.adapter.js';
import { SupabaseCheckoutRepository } from '../infra/checkout/supabase-checkout.repository.js';
import { SupabasePromoCodeValidatorAdapter } from '../infra/checkout/supabase-promo-code-validator.adapter.js';
import { SupabaseCartValidatorAdapter } from '../infra/checkout/supabase-cart-validator.adapter.js';

// Support adapters
import { SupabaseSupportTicketRepository } from '../infra/support/supabase-support-ticket.repository.js';
import { SupabaseAttachmentStorageAdapter } from '../infra/support/supabase-attachment-storage.adapter.js';

// Library adapters
import { SupabaseUserLibraryRepository } from '../infra/library/supabase-user-library.repository.js';

// Notification adapters
import { SupabaseNotificationRepository } from '../infra/notifications/supabase-notification.repository.js';
import { SupabaseNotificationPreferencesRepository } from '../infra/notifications/supabase-notification-preferences.repository.js';
import { SupabasePushTokenRepository } from '../infra/notifications/supabase-push-token.repository.js';

// Review adapters
import { SupabaseReviewRepository } from '../infra/reviews/supabase-review.repository.js';

// Product adapters
import { SupabaseProductRepository } from '../infra/products/supabase-product.repository.js';
import { SupabaseReferenceDataRepository } from '../infra/products/supabase-reference-data.repository.js';
import { SupabaseStockNotificationRepository } from '../infra/products/supabase-stock-notification.repository.js';

// Analytics adapters
import { SupabaseAnalyticsRepository } from '../infra/analytics/supabase-analytics.repository.js';
import { StubGeoServiceAdapter } from '../infra/analytics/stub-geo-service.adapter.js';

// Wallet adapters
import { SupabaseWalletRepository } from '../infra/wallet/supabase-wallet.repository.js';

// Referral adapters
import { SupabaseReferralRepository } from '../infra/referrals/supabase-referral.repository.js';

// Newsletter adapters
import { SupabaseNewsletterRepository } from '../infra/newsletter/supabase-newsletter.repository.js';

// Security adapters
import { SupabaseSecurityHoldRepository } from '../infra/security/supabase-security-hold.repository.js';
import { SupabaseVerificationStorageAdapter } from '../infra/security/supabase-verification-storage.adapter.js';

// Card Challenge adapters
import { SupabaseCardChallengeRepository } from '../infra/card-challenge/supabase-card-challenge.repository.js';
import { StubMicroAuthAdapter } from '../infra/card-challenge/stub-micro-auth.adapter.js';

// Price Match adapters
import { SupabasePriceMatchRepository } from '../infra/price-match/supabase-price-match.repository.js';

// Payment adapters (verification, capture, webhooks)
import { StubPaymentVerifierAdapter } from '../infra/payments/stub-payment-verifier.adapter.js';
import { StubRiskAssessorAdapter } from '../infra/payments/stub-risk-assessor.adapter.js';
import { StubFulfillmentAdapter } from '../infra/payments/stub-fulfillment.adapter.js';
import { StubPaymentCapturerAdapter } from '../infra/payments/stub-payment-capturer.adapter.js';
import { StubWebhookVerifierAdapter } from '../infra/payments/stub-webhook-verifier.adapter.js';
import { StubWebhookHandlerAdapter } from '../infra/payments/stub-webhook-handler.adapter.js';

// Guest adapters
import { SupabaseGuestSessionRepository } from '../infra/guest/supabase-guest-session.repository.js';

// Domain services
import { AuthService } from '../core/services/auth/auth.service.js';
import { ProfileService } from '../core/services/profile/profile.service.js';
import { OrderService } from '../core/services/orders/order.service.js';
import { KeyDeliveryService } from '../core/services/orders/key-delivery.service.js';
import { CheckoutService } from '../core/services/checkout/checkout.service.js';
import { SupportService } from '../core/services/support/support.service.js';
import { LibraryService } from '../core/services/library/library.service.js';
import { NotificationService } from '../core/services/notifications/notification.service.js';
import { ReviewService } from '../core/services/reviews/review.service.js';
import { ProductService } from '../core/services/products/product.service.js';
import { AnalyticsService } from '../core/services/analytics/analytics.service.js';
import { WalletService } from '../core/services/wallet/wallet.service.js';
import { ReferralService } from '../core/services/referrals/referral.service.js';
import { NewsletterService } from '../core/services/newsletter/newsletter.service.js';
import { SecurityService } from '../core/services/security/security.service.js';
import { CardChallengeService } from '../core/services/card-challenge/card-challenge.service.js';
import { PriceMatchService } from '../core/services/price-match/price-match.service.js';
import { PaymentVerificationService } from '../core/services/payments/payment-verification.service.js';
import { PaymentCaptureService } from '../core/services/payments/payment-capture.service.js';
import { WebhookService } from '../core/services/payments/webhook.service.js';
import { GuestAccessService } from '../core/services/guest/guest-access.service.js';

// --- Infrastructure ---
container.register(TOKENS.Database, { useClass: SupabaseDbAdapter });
container.register(TOKENS.AuthProvider, { useClass: SupabaseAuthAdapter });
container.register(TOKENS.EmailSender, { useClass: ResendEmailAdapter });
container.register(TOKENS.EventBus, { useClass: InProcessEventBusAdapter });
container.register(TOKENS.RecaptchaVerifier, { useClass: RecaptchaAdapter });
container.register(TOKENS.UserRepository, { useClass: SupabaseUserRepository });
container.register(TOKENS.RateLimiter, { useClass: SupabaseRateLimiterAdapter });
container.register(TOKENS.IpBlocklist, { useClass: SupabaseIpBlocklistAdapter });

// --- Profile ---
container.register(TOKENS.UserProfileRepository, { useClass: SupabaseUserProfileRepository });
container.register(TOKENS.AvatarStorage, { useClass: SupabaseAvatarStorageAdapter });
container.register(TOKENS.SessionRepository, { useClass: SupabaseSessionRepository });

// --- Orders ---
container.register(TOKENS.OrderRepository, { useClass: SupabaseOrderRepository });
container.register(TOKENS.ProductKeyRepository, { useClass: SupabaseProductKeyRepository });
container.register(TOKENS.OrderAccessTokenRepository, { useClass: SupabaseOrderAccessTokenRepository });
container.register(TOKENS.PaymentGateway, { useClass: StripePaymentGatewayAdapter });

// --- Checkout ---
container.register(TOKENS.PaymentProvider, { useClass: StripePaymentAdapter });
container.register(TOKENS.CheckoutRepository, { useClass: SupabaseCheckoutRepository });
container.register(TOKENS.PromoCodeValidator, { useClass: SupabasePromoCodeValidatorAdapter });
container.register(TOKENS.CartValidator, { useClass: SupabaseCartValidatorAdapter });

// --- Support ---
container.register(TOKENS.SupportTicketRepository, { useClass: SupabaseSupportTicketRepository });
container.register(TOKENS.AttachmentStorage, { useClass: SupabaseAttachmentStorageAdapter });

// --- Library ---
container.register(TOKENS.UserLibraryRepository, { useClass: SupabaseUserLibraryRepository });

// --- Notifications ---
container.register(TOKENS.NotificationRepository, { useClass: SupabaseNotificationRepository });
container.register(TOKENS.NotificationPreferencesRepository, { useClass: SupabaseNotificationPreferencesRepository });
container.register(TOKENS.PushTokenRepository, { useClass: SupabasePushTokenRepository });

// --- Reviews ---
container.register(TOKENS.ReviewRepository, { useClass: SupabaseReviewRepository });

// --- Products ---
container.register(TOKENS.ProductRepository, { useClass: SupabaseProductRepository });
container.register(TOKENS.ReferenceDataRepository, { useClass: SupabaseReferenceDataRepository });
container.register(TOKENS.StockNotificationRepository, { useClass: SupabaseStockNotificationRepository });

// --- Analytics ---
container.register(TOKENS.AnalyticsRepository, { useClass: SupabaseAnalyticsRepository });
container.register(TOKENS.GeoService, { useClass: StubGeoServiceAdapter });

// --- Wallet ---
container.register(TOKENS.WalletRepository, { useClass: SupabaseWalletRepository });

// --- Referrals ---
container.register(TOKENS.ReferralRepository, { useClass: SupabaseReferralRepository });

// --- Newsletter ---
container.register(TOKENS.NewsletterRepository, { useClass: SupabaseNewsletterRepository });

// --- Security ---
container.register(TOKENS.SecurityHoldRepository, { useClass: SupabaseSecurityHoldRepository });
container.register(TOKENS.VerificationStorage, { useClass: SupabaseVerificationStorageAdapter });

// --- Card Challenge ---
container.register(TOKENS.CardChallengeRepository, { useClass: SupabaseCardChallengeRepository });
container.register(TOKENS.MicroAuthProvider, { useClass: StubMicroAuthAdapter });

// --- Price Match ---
container.register(TOKENS.PriceMatchRepository, { useClass: SupabasePriceMatchRepository });

// --- Payment Verification + Capture ---
container.register(TOKENS.PaymentVerifier, { useClass: StubPaymentVerifierAdapter });
container.register(TOKENS.RiskAssessor, { useClass: StubRiskAssessorAdapter });
container.register(TOKENS.FulfillmentService, { useClass: StubFulfillmentAdapter });
container.register(TOKENS.PaymentCapturer, { useClass: StubPaymentCapturerAdapter });

// --- Webhooks ---
container.register(TOKENS.WebhookVerifier, { useClass: StubWebhookVerifierAdapter });
container.register(TOKENS.WebhookHandler, { useClass: StubWebhookHandlerAdapter });

// --- Guest ---
container.register(TOKENS.GuestSessionRepository, { useClass: SupabaseGuestSessionRepository });

// --- Domain Services ---
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

export { container };
