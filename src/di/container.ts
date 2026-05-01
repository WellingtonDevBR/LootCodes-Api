import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS, UC_TOKENS } from './tokens.js';

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
import { SupabaseCategoryRepository } from '../infra/products/supabase-category.repository.js';
import { SupabasePricingRepository } from '../infra/products/supabase-pricing.repository.js';
import { SupabaseGeoRestrictionRepository } from '../infra/products/supabase-geo-restriction.repository.js';
import { SupabaseStockNotificationRepository } from '../infra/products/supabase-stock-notification.repository.js';

// Analytics adapters
import { SupabaseAnalyticsRepository } from '../infra/analytics/supabase-analytics.repository.js';
import { SupabaseGeoServiceAdapter } from '../infra/analytics/supabase-geo-service.adapter.js';

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
import { StripePaymentVerifierAdapter } from '../infra/payments/stripe-payment-verifier.adapter.js';
import { SupabaseRiskAssessorAdapter } from '../infra/payments/supabase-risk-assessor.adapter.js';
import { SupabaseFulfillmentAdapter } from '../infra/payments/supabase-fulfillment.adapter.js';
import { StripePaymentCapturerAdapter } from '../infra/payments/stripe-payment-capturer.adapter.js';
import { StripeWebhookVerifierAdapter } from '../infra/payments/stripe-webhook-verifier.adapter.js';
import { SupabaseWebhookHandlerAdapter } from '../infra/payments/supabase-webhook-handler.adapter.js';

// Recommendation adapters
import { SupabaseRecommendationRepository } from '../infra/products/supabase-recommendation.repository.js';

// Search adapters
import { AlgoliaSearchAdapter } from '../infra/search/algolia-search.adapter.js';

// Guest adapters
import { SupabaseGuestSessionRepository } from '../infra/guest/supabase-guest-session.repository.js';

// --- Auth use cases ---
import { HandleAuthUseCase } from '../core/use-cases/auth/handle-auth.use-case.js';

// --- Profile use cases ---
import { GetProfileUseCase } from '../core/use-cases/profile/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../core/use-cases/profile/update-profile.use-case.js';
import { DeleteAccountUseCase } from '../core/use-cases/profile/delete-account.use-case.js';
import { RestoreAccountUseCase } from '../core/use-cases/profile/restore-account.use-case.js';
import { ChangeEmailUseCase } from '../core/use-cases/profile/change-email.use-case.js';
import { ChangePasswordUseCase } from '../core/use-cases/profile/change-password.use-case.js';
import { GetRoleUseCase } from '../core/use-cases/profile/get-role.use-case.js';
import { UpsertSessionUseCase } from '../core/use-cases/profile/upsert-session.use-case.js';
import { GetActiveSessionsUseCase } from '../core/use-cases/profile/get-active-sessions.use-case.js';
import { TerminateSessionUseCase } from '../core/use-cases/profile/terminate-session.use-case.js';
import { UploadAvatarUseCase } from '../core/use-cases/profile/upload-avatar.use-case.js';

// --- Order use cases ---
import { GetOrderUseCase } from '../core/use-cases/orders/get-order.use-case.js';
import { GetOrderDetailUseCase } from '../core/use-cases/orders/get-order-detail.use-case.js';
import { GetUserOrdersUseCase } from '../core/use-cases/orders/get-user-orders.use-case.js';
import { GetUserOrdersForSupportUseCase } from '../core/use-cases/orders/get-user-orders-for-support.use-case.js';
import { ValidateAccessTokenUseCase } from '../core/use-cases/orders/validate-access-token.use-case.js';
import { GenerateAccessTokenUseCase } from '../core/use-cases/orders/generate-access-token.use-case.js';
import { RefreshAccessTokenUseCase } from '../core/use-cases/orders/refresh-access-token.use-case.js';
import { ClaimGuestOrderUseCase } from '../core/use-cases/orders/claim-guest-order.use-case.js';

// --- Key delivery use cases ---
import { GetKeysForOrderUseCase } from '../core/use-cases/key-delivery/get-keys-for-order.use-case.js';
import { GetKeysForOrderItemUseCase } from '../core/use-cases/key-delivery/get-keys-for-order-item.use-case.js';
import { RevealKeyUseCase } from '../core/use-cases/key-delivery/reveal-key.use-case.js';
import { CheckKeyViewedUseCase } from '../core/use-cases/key-delivery/check-key-viewed.use-case.js';

// --- Checkout use cases ---
import { InitializeCheckoutUseCase } from '../core/use-cases/checkout/initialize-checkout.use-case.js';
import { UpdateCheckoutUseCase } from '../core/use-cases/checkout/update-checkout.use-case.js';
import { CancelCheckoutUseCase } from '../core/use-cases/checkout/cancel-checkout.use-case.js';
import { CheckoutWithApprovalUseCase } from '../core/use-cases/checkout/checkout-with-approval.use-case.js';
import { ValidatePromoCodeUseCase } from '../core/use-cases/checkout/validate-promo-code.use-case.js';
import { GetPaymentMethodsConfigUseCase } from '../core/use-cases/checkout/get-payment-methods-config.use-case.js';

// --- Support use cases ---
import { CreateTicketUseCase } from '../core/use-cases/support/create-ticket.use-case.js';
import { GetTicketUseCase } from '../core/use-cases/support/get-ticket.use-case.js';
import { GetUserTicketsUseCase } from '../core/use-cases/support/get-user-tickets.use-case.js';
import { AddMessageUseCase } from '../core/use-cases/support/add-message.use-case.js';
import { UpdateStatusUseCase } from '../core/use-cases/support/update-status.use-case.js';
import { SubmitFeedbackUseCase } from '../core/use-cases/support/submit-feedback.use-case.js';
import { GetVerificationTicketsUseCase } from '../core/use-cases/support/get-verification-tickets.use-case.js';
import { UploadAttachmentUseCase } from '../core/use-cases/support/upload-attachment.use-case.js';

// --- Library use cases ---
import { ListLibraryUseCase } from '../core/use-cases/library/list-library.use-case.js';
import { SetLibraryStatusUseCase } from '../core/use-cases/library/set-library-status.use-case.js';
import { RemoveFromLibraryUseCase } from '../core/use-cases/library/remove-from-library.use-case.js';
import { UpdateLibraryEntryUseCase } from '../core/use-cases/library/update-library-entry.use-case.js';

// --- Notification use cases ---
import { ListNotificationsUseCase } from '../core/use-cases/notifications/list-notifications.use-case.js';
import { GetUnreadCountUseCase } from '../core/use-cases/notifications/get-unread-count.use-case.js';
import { MarkReadUseCase } from '../core/use-cases/notifications/mark-read.use-case.js';
import { MarkAllReadUseCase } from '../core/use-cases/notifications/mark-all-read.use-case.js';
import { GetPreferencesUseCase } from '../core/use-cases/notifications/get-preferences.use-case.js';
import { UpdatePreferencesUseCase } from '../core/use-cases/notifications/update-preferences.use-case.js';
import { RegisterPushTokenUseCase } from '../core/use-cases/notifications/register-push-token.use-case.js';
import { RemovePushTokenUseCase } from '../core/use-cases/notifications/remove-push-token.use-case.js';

// --- Review use cases ---
import { GetProductReviewsUseCase } from '../core/use-cases/reviews/get-product-reviews.use-case.js';
import { GetProductRatingUseCase } from '../core/use-cases/reviews/get-product-rating.use-case.js';
import { SubmitReviewUseCase } from '../core/use-cases/reviews/submit-review.use-case.js';
import { CheckEligibilityUseCase } from '../core/use-cases/reviews/check-eligibility.use-case.js';

// --- Products: catalog use cases ---
import { GetProductBySlugUseCase } from '../core/use-cases/products/catalog/get-product-by-slug.use-case.js';
import { GetProductByIdUseCase } from '../core/use-cases/products/catalog/get-product-by-id.use-case.js';
import { GetVariantsUseCase } from '../core/use-cases/products/catalog/get-variants.use-case.js';
import { GetGalleryUseCase } from '../core/use-cases/products/catalog/get-gallery.use-case.js';
import { GetFeaturedUseCase } from '../core/use-cases/products/catalog/get-featured.use-case.js';

// --- Products: stock use cases ---
import { CheckStockUseCase } from '../core/use-cases/products/stock/check-stock.use-case.js';
import { BatchCheckStockUseCase } from '../core/use-cases/products/stock/batch-check-stock.use-case.js';
import { SubscribeStockNotificationUseCase } from '../core/use-cases/products/stock/subscribe-stock-notification.use-case.js';
import { UnsubscribeStockNotificationUseCase } from '../core/use-cases/products/stock/unsubscribe-stock-notification.use-case.js';
import { IsSubscribedToStockUseCase } from '../core/use-cases/products/stock/is-subscribed-to-stock.use-case.js';
import { IsVariantPurchasableUseCase } from '../core/use-cases/products/stock/is-variant-purchasable.use-case.js';

// --- Products: reference use cases ---
import { GetPlatformsUseCase } from '../core/use-cases/products/reference/get-platforms.use-case.js';
import { GetRegionsUseCase } from '../core/use-cases/products/reference/get-regions.use-case.js';
import { GetGenresUseCase } from '../core/use-cases/products/reference/get-genres.use-case.js';
import { GetFaqsUseCase } from '../core/use-cases/products/reference/get-faqs.use-case.js';
import { GetPlatformBySlugUseCase } from '../core/use-cases/products/reference/get-platform-by-slug.use-case.js';
import { GetPlatformNavItemsUseCase } from '../core/use-cases/products/reference/get-platform-nav-items.use-case.js';
import { GetPlatformFamilyBySlugUseCase } from '../core/use-cases/products/reference/get-platform-family-by-slug.use-case.js';

// --- Products: categories use cases ---
import { GetCategoriesUseCase } from '../core/use-cases/products/categories/get-categories.use-case.js';
import { GetCategoryBySlugUseCase } from '../core/use-cases/products/categories/get-category-by-slug.use-case.js';
import { GetSubcategoriesUseCase } from '../core/use-cases/products/categories/get-subcategories.use-case.js';
import { GetCategoryFaqsUseCase } from '../core/use-cases/products/categories/get-category-faqs.use-case.js';

// --- Products: pricing use cases ---
import { GetLocalizedPriceUseCase } from '../core/use-cases/products/pricing/get-localized-price.use-case.js';
import { GetBatchLocalizedPricesUseCase } from '../core/use-cases/products/pricing/get-batch-localized-prices.use-case.js';
import { HasPricesForCurrencyUseCase } from '../core/use-cases/products/pricing/has-prices-for-currency.use-case.js';
import { SyncCurrencyRatesUseCase } from '../core/use-cases/products/pricing/sync-currency-rates.use-case.js';

// --- Products: geo use cases ---
import { IsCountryAllowedUseCase } from '../core/use-cases/products/geo/is-country-allowed.use-case.js';
import { GetExcludedCountriesUseCase } from '../core/use-cases/products/geo/get-excluded-countries.use-case.js';
import { GetRestrictedVariantsUseCase } from '../core/use-cases/products/geo/get-restricted-variants.use-case.js';
import { GetRestrictedRegionsUseCase } from '../core/use-cases/products/geo/get-restricted-regions.use-case.js';

// --- Products: storefront use cases ---
import { GetActivePromoHeaderUseCase } from '../core/use-cases/products/storefront/get-active-promo-header.use-case.js';
import { GetTrustpilotDataUseCase } from '../core/use-cases/products/storefront/get-trustpilot-data.use-case.js';

// --- Analytics use cases ---
import { GeolocateUseCase } from '../core/use-cases/analytics/geolocate.use-case.js';
import { TrackBatchUseCase } from '../core/use-cases/analytics/track-batch.use-case.js';
import { TrackCartEventUseCase } from '../core/use-cases/analytics/track-cart-event.use-case.js';
import { TrackProductViewDurationUseCase } from '../core/use-cases/analytics/track-product-view-duration.use-case.js';
import { TrackSearchEventUseCase } from '../core/use-cases/analytics/track-search-event.use-case.js';
import { UpdateSessionOutcomeUseCase } from '../core/use-cases/analytics/update-session-outcome.use-case.js';

// --- Wallet use cases ---
import { GetBalanceUseCase } from '../core/use-cases/wallet/get-balance.use-case.js';
import { ListLedgerUseCase } from '../core/use-cases/wallet/list-ledger.use-case.js';
import { GetOrderEarningsUseCase } from '../core/use-cases/wallet/get-order-earnings.use-case.js';
import { ClaimReviewRewardUseCase } from '../core/use-cases/wallet/claim-review-reward.use-case.js';

// --- Referral use cases ---
import { GetReferralMeUseCase } from '../core/use-cases/referrals/get-referral-me.use-case.js';
import { ListReferralsUseCase } from '../core/use-cases/referrals/list-referrals.use-case.js';
import { GetLeaderboardUseCase } from '../core/use-cases/referrals/get-leaderboard.use-case.js';
import { OpenDisputeUseCase } from '../core/use-cases/referrals/open-dispute.use-case.js';

// --- Newsletter use cases ---
import { SubscribeUseCase } from '../core/use-cases/newsletter/subscribe.use-case.js';
import { ConfirmUseCase } from '../core/use-cases/newsletter/confirm.use-case.js';
import { UnsubscribeUseCase } from '../core/use-cases/newsletter/unsubscribe.use-case.js';

// --- Security use cases ---
import { GetHoldUseCase } from '../core/use-cases/security/get-hold.use-case.js';
import { GetHoldStatusUseCase } from '../core/use-cases/security/get-hold-status.use-case.js';
import { UploadDocumentUseCase } from '../core/use-cases/security/upload-document.use-case.js';
import { SubmitResponseUseCase } from '../core/use-cases/security/submit-response.use-case.js';
import { UnlockAccountUseCase } from '../core/use-cases/security/unlock-account.use-case.js';

// --- Card challenge use cases ---
import { StartChallengeUseCase } from '../core/use-cases/card-challenge/start-challenge.use-case.js';
import { VerifyChallengeUseCase } from '../core/use-cases/card-challenge/verify-challenge.use-case.js';
import { ChooseIdUseCase } from '../core/use-cases/card-challenge/choose-id.use-case.js';

// --- Price match use cases ---
import { SubmitClaimUseCase } from '../core/use-cases/price-match/submit-claim.use-case.js';
import { GetUserClaimsUseCase } from '../core/use-cases/price-match/get-user-claims.use-case.js';
import { GetConfigUseCase } from '../core/use-cases/price-match/get-config.use-case.js';
import { GetClaimPromoCodeUseCase } from '../core/use-cases/price-match/get-claim-promo-code.use-case.js';

// --- Payment use cases ---
import { VerifyAndFulfillUseCase } from '../core/use-cases/payments/verify-and-fulfill.use-case.js';
import { CapturePaymentUseCase } from '../core/use-cases/payments/capture-payment.use-case.js';

// --- Webhook use cases ---
import { HandleStripeWebhookUseCase } from '../core/use-cases/webhooks/handle-stripe-webhook.use-case.js';
import { HandlePayPalWebhookUseCase } from '../core/use-cases/webhooks/handle-paypal-webhook.use-case.js';

// --- Guest use cases ---
import { GetGuestOrderUseCase } from '../core/use-cases/guest/get-guest-order.use-case.js';
import { GetGuestOrderKeysUseCase } from '../core/use-cases/guest/get-guest-order-keys.use-case.js';
import { RevealGuestKeyUseCase } from '../core/use-cases/guest/reveal-guest-key.use-case.js';
import { CreateGuestSupportTicketUseCase } from '../core/use-cases/guest/create-guest-support-ticket.use-case.js';

// --- Recommendation use cases ---
import { GetSimilarUseCase } from '../core/use-cases/recommendations/get-similar.use-case.js';
import { GetAlsoViewedUseCase } from '../core/use-cases/recommendations/get-also-viewed.use-case.js';
import { GetBoughtTogetherUseCase } from '../core/use-cases/recommendations/get-bought-together.use-case.js';
import { GetBatchRecommendationsUseCase } from '../core/use-cases/recommendations/get-batch-recommendations.use-case.js';
import { GetPersonalizedUseCase } from '../core/use-cases/recommendations/get-personalized.use-case.js';
import { GetPopularUseCase } from '../core/use-cases/recommendations/get-popular.use-case.js';
import { GetLatestReleasesUseCase } from '../core/use-cases/recommendations/get-latest-releases.use-case.js';
import { GetPreOrdersUseCase } from '../core/use-cases/recommendations/get-pre-orders.use-case.js';

// --- Search use cases ---
import { SearchUseCase } from '../core/use-cases/search/search.use-case.js';
import { MerchandisedSearchUseCase } from '../core/use-cases/search/merchandised-search.use-case.js';

// --- Additional use cases (architecture cleanup) ---
import { ExchangeGuestSessionUseCase } from '../core/use-cases/guest/exchange-guest-session.use-case.js';
import { ConvertCartPricesUseCase } from '../core/use-cases/products/pricing/convert-cart-prices.use-case.js';
import { LogAccessAttemptUseCase } from '../core/use-cases/orders/log-access-attempt.use-case.js';

// ============================================================
// Infrastructure adapter registrations
// ============================================================

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
container.register(TOKENS.CategoryRepository, { useClass: SupabaseCategoryRepository });
container.register(TOKENS.PricingRepository, { useClass: SupabasePricingRepository });
container.register(TOKENS.GeoRestrictionRepository, { useClass: SupabaseGeoRestrictionRepository });
container.register(TOKENS.StockNotificationRepository, { useClass: SupabaseStockNotificationRepository });

// --- Analytics ---
container.register(TOKENS.AnalyticsRepository, { useClass: SupabaseAnalyticsRepository });
container.register(TOKENS.GeoService, { useClass: SupabaseGeoServiceAdapter });

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
container.register(TOKENS.PaymentVerifier, { useClass: StripePaymentVerifierAdapter });
container.register(TOKENS.RiskAssessor, { useClass: SupabaseRiskAssessorAdapter });
container.register(TOKENS.FulfillmentService, { useClass: SupabaseFulfillmentAdapter });
container.register(TOKENS.PaymentCapturer, { useClass: StripePaymentCapturerAdapter });

// --- Webhooks ---
container.register(TOKENS.WebhookVerifier, { useClass: StripeWebhookVerifierAdapter });
container.register(TOKENS.WebhookHandler, { useClass: SupabaseWebhookHandlerAdapter });

// --- Recommendations ---
container.register(TOKENS.RecommendationRepository, { useClass: SupabaseRecommendationRepository });

// --- Search ---
container.register(TOKENS.SearchProvider, { useClass: AlgoliaSearchAdapter });

// --- Guest ---
container.register(TOKENS.GuestSessionRepository, { useClass: SupabaseGuestSessionRepository });

// ============================================================
// Use case registrations
// ============================================================

// --- Auth Use Cases ---
container.register(UC_TOKENS.HandleAuth, { useClass: HandleAuthUseCase });

// --- Profile Use Cases ---
container.register(UC_TOKENS.GetProfile, { useClass: GetProfileUseCase });
container.register(UC_TOKENS.UpdateProfile, { useClass: UpdateProfileUseCase });
container.register(UC_TOKENS.DeleteAccount, { useClass: DeleteAccountUseCase });
container.register(UC_TOKENS.RestoreAccount, { useClass: RestoreAccountUseCase });
container.register(UC_TOKENS.ChangeEmail, { useClass: ChangeEmailUseCase });
container.register(UC_TOKENS.ChangePassword, { useClass: ChangePasswordUseCase });
container.register(UC_TOKENS.GetRole, { useClass: GetRoleUseCase });
container.register(UC_TOKENS.UpsertSession, { useClass: UpsertSessionUseCase });
container.register(UC_TOKENS.GetActiveSessions, { useClass: GetActiveSessionsUseCase });
container.register(UC_TOKENS.TerminateSession, { useClass: TerminateSessionUseCase });
container.register(UC_TOKENS.UploadAvatar, { useClass: UploadAvatarUseCase });

// --- Order Use Cases ---
container.register(UC_TOKENS.GetOrder, { useClass: GetOrderUseCase });
container.register(UC_TOKENS.GetOrderDetail, { useClass: GetOrderDetailUseCase });
container.register(UC_TOKENS.GetUserOrders, { useClass: GetUserOrdersUseCase });
container.register(UC_TOKENS.GetUserOrdersForSupport, { useClass: GetUserOrdersForSupportUseCase });
container.register(UC_TOKENS.ValidateAccessToken, { useClass: ValidateAccessTokenUseCase });
container.register(UC_TOKENS.GenerateAccessToken, { useClass: GenerateAccessTokenUseCase });
container.register(UC_TOKENS.RefreshAccessToken, { useClass: RefreshAccessTokenUseCase });
container.register(UC_TOKENS.ClaimGuestOrder, { useClass: ClaimGuestOrderUseCase });

// --- Key Delivery Use Cases ---
container.register(UC_TOKENS.GetKeysForOrder, { useClass: GetKeysForOrderUseCase });
container.register(UC_TOKENS.GetKeysForOrderItem, { useClass: GetKeysForOrderItemUseCase });
container.register(UC_TOKENS.RevealKey, { useClass: RevealKeyUseCase });
container.register(UC_TOKENS.CheckKeyViewed, { useClass: CheckKeyViewedUseCase });

// --- Checkout Use Cases ---
container.register(UC_TOKENS.InitializeCheckout, { useClass: InitializeCheckoutUseCase });
container.register(UC_TOKENS.UpdateCheckout, { useClass: UpdateCheckoutUseCase });
container.register(UC_TOKENS.CancelCheckout, { useClass: CancelCheckoutUseCase });
container.register(UC_TOKENS.CheckoutWithApproval, { useClass: CheckoutWithApprovalUseCase });
container.register(UC_TOKENS.ValidatePromoCode, { useClass: ValidatePromoCodeUseCase });
container.register(UC_TOKENS.GetPaymentMethodsConfig, { useClass: GetPaymentMethodsConfigUseCase });

// --- Support Use Cases ---
container.register(UC_TOKENS.CreateTicket, { useClass: CreateTicketUseCase });
container.register(UC_TOKENS.GetTicket, { useClass: GetTicketUseCase });
container.register(UC_TOKENS.GetUserTickets, { useClass: GetUserTicketsUseCase });
container.register(UC_TOKENS.AddMessage, { useClass: AddMessageUseCase });
container.register(UC_TOKENS.UpdateTicketStatus, { useClass: UpdateStatusUseCase });
container.register(UC_TOKENS.SubmitFeedback, { useClass: SubmitFeedbackUseCase });
container.register(UC_TOKENS.GetVerificationTickets, { useClass: GetVerificationTicketsUseCase });
container.register(UC_TOKENS.UploadAttachment, { useClass: UploadAttachmentUseCase });

// --- Library Use Cases ---
container.register(UC_TOKENS.ListLibrary, { useClass: ListLibraryUseCase });
container.register(UC_TOKENS.SetLibraryStatus, { useClass: SetLibraryStatusUseCase });
container.register(UC_TOKENS.RemoveFromLibrary, { useClass: RemoveFromLibraryUseCase });
container.register(UC_TOKENS.UpdateLibraryEntry, { useClass: UpdateLibraryEntryUseCase });

// --- Notification Use Cases ---
container.register(UC_TOKENS.ListNotifications, { useClass: ListNotificationsUseCase });
container.register(UC_TOKENS.GetUnreadCount, { useClass: GetUnreadCountUseCase });
container.register(UC_TOKENS.MarkRead, { useClass: MarkReadUseCase });
container.register(UC_TOKENS.MarkAllRead, { useClass: MarkAllReadUseCase });
container.register(UC_TOKENS.GetPreferences, { useClass: GetPreferencesUseCase });
container.register(UC_TOKENS.UpdatePreferences, { useClass: UpdatePreferencesUseCase });
container.register(UC_TOKENS.RegisterPushToken, { useClass: RegisterPushTokenUseCase });
container.register(UC_TOKENS.RemovePushToken, { useClass: RemovePushTokenUseCase });

// --- Review Use Cases ---
container.register(UC_TOKENS.GetProductReviews, { useClass: GetProductReviewsUseCase });
container.register(UC_TOKENS.GetProductRating, { useClass: GetProductRatingUseCase });
container.register(UC_TOKENS.SubmitReview, { useClass: SubmitReviewUseCase });
container.register(UC_TOKENS.CheckEligibility, { useClass: CheckEligibilityUseCase });

// --- Products: Catalog Use Cases ---
container.register(UC_TOKENS.GetProductBySlug, { useClass: GetProductBySlugUseCase });
container.register(UC_TOKENS.GetProductById, { useClass: GetProductByIdUseCase });
container.register(UC_TOKENS.GetVariants, { useClass: GetVariantsUseCase });
container.register(UC_TOKENS.GetGallery, { useClass: GetGalleryUseCase });
container.register(UC_TOKENS.GetFeatured, { useClass: GetFeaturedUseCase });

// --- Products: Stock Use Cases ---
container.register(UC_TOKENS.CheckStock, { useClass: CheckStockUseCase });
container.register(UC_TOKENS.BatchCheckStock, { useClass: BatchCheckStockUseCase });
container.register(UC_TOKENS.SubscribeStockNotification, { useClass: SubscribeStockNotificationUseCase });
container.register(UC_TOKENS.UnsubscribeStockNotification, { useClass: UnsubscribeStockNotificationUseCase });
container.register(UC_TOKENS.IsSubscribedToStock, { useClass: IsSubscribedToStockUseCase });
container.register(UC_TOKENS.IsVariantPurchasable, { useClass: IsVariantPurchasableUseCase });

// --- Products: Reference Use Cases ---
container.register(UC_TOKENS.GetPlatforms, { useClass: GetPlatformsUseCase });
container.register(UC_TOKENS.GetRegions, { useClass: GetRegionsUseCase });
container.register(UC_TOKENS.GetGenres, { useClass: GetGenresUseCase });
container.register(UC_TOKENS.GetFaqs, { useClass: GetFaqsUseCase });
container.register(UC_TOKENS.GetPlatformBySlug, { useClass: GetPlatformBySlugUseCase });
container.register(UC_TOKENS.GetPlatformNavItems, { useClass: GetPlatformNavItemsUseCase });
container.register(UC_TOKENS.GetPlatformFamilyBySlug, { useClass: GetPlatformFamilyBySlugUseCase });

// --- Products: Categories Use Cases ---
container.register(UC_TOKENS.GetCategories, { useClass: GetCategoriesUseCase });
container.register(UC_TOKENS.GetCategoryBySlug, { useClass: GetCategoryBySlugUseCase });
container.register(UC_TOKENS.GetSubcategories, { useClass: GetSubcategoriesUseCase });
container.register(UC_TOKENS.GetCategoryFaqs, { useClass: GetCategoryFaqsUseCase });

// --- Products: Pricing Use Cases ---
container.register(UC_TOKENS.GetLocalizedPrice, { useClass: GetLocalizedPriceUseCase });
container.register(UC_TOKENS.GetBatchLocalizedPrices, { useClass: GetBatchLocalizedPricesUseCase });
container.register(UC_TOKENS.HasPricesForCurrency, { useClass: HasPricesForCurrencyUseCase });
container.register(UC_TOKENS.SyncCurrencyRates, { useClass: SyncCurrencyRatesUseCase });

// --- Products: Geo Use Cases ---
container.register(UC_TOKENS.IsCountryAllowed, { useClass: IsCountryAllowedUseCase });
container.register(UC_TOKENS.GetExcludedCountries, { useClass: GetExcludedCountriesUseCase });
container.register(UC_TOKENS.GetRestrictedVariants, { useClass: GetRestrictedVariantsUseCase });
container.register(UC_TOKENS.GetRestrictedRegions, { useClass: GetRestrictedRegionsUseCase });

// --- Products: Storefront Use Cases ---
container.register(UC_TOKENS.GetActivePromoHeader, { useClass: GetActivePromoHeaderUseCase });
container.register(UC_TOKENS.GetTrustpilotData, { useClass: GetTrustpilotDataUseCase });

// --- Analytics Use Cases ---
container.register(UC_TOKENS.Geolocate, { useClass: GeolocateUseCase });
container.register(UC_TOKENS.TrackBatch, { useClass: TrackBatchUseCase });
container.register(UC_TOKENS.TrackCartEvent, { useClass: TrackCartEventUseCase });
container.register(UC_TOKENS.TrackProductViewDuration, { useClass: TrackProductViewDurationUseCase });
container.register(UC_TOKENS.TrackSearchEvent, { useClass: TrackSearchEventUseCase });
container.register(UC_TOKENS.UpdateSessionOutcome, { useClass: UpdateSessionOutcomeUseCase });

// --- Wallet Use Cases ---
container.register(UC_TOKENS.GetBalance, { useClass: GetBalanceUseCase });
container.register(UC_TOKENS.ListLedger, { useClass: ListLedgerUseCase });
container.register(UC_TOKENS.GetOrderEarnings, { useClass: GetOrderEarningsUseCase });
container.register(UC_TOKENS.ClaimReviewReward, { useClass: ClaimReviewRewardUseCase });

// --- Referral Use Cases ---
container.register(UC_TOKENS.GetReferralMe, { useClass: GetReferralMeUseCase });
container.register(UC_TOKENS.ListReferrals, { useClass: ListReferralsUseCase });
container.register(UC_TOKENS.GetLeaderboard, { useClass: GetLeaderboardUseCase });
container.register(UC_TOKENS.OpenDispute, { useClass: OpenDisputeUseCase });

// --- Newsletter Use Cases ---
container.register(UC_TOKENS.Subscribe, { useClass: SubscribeUseCase });
container.register(UC_TOKENS.Confirm, { useClass: ConfirmUseCase });
container.register(UC_TOKENS.Unsubscribe, { useClass: UnsubscribeUseCase });

// --- Security Use Cases ---
container.register(UC_TOKENS.GetHold, { useClass: GetHoldUseCase });
container.register(UC_TOKENS.GetHoldStatus, { useClass: GetHoldStatusUseCase });
container.register(UC_TOKENS.UploadDocument, { useClass: UploadDocumentUseCase });
container.register(UC_TOKENS.SubmitHoldResponse, { useClass: SubmitResponseUseCase });
container.register(UC_TOKENS.UnlockAccount, { useClass: UnlockAccountUseCase });

// --- Card Challenge Use Cases ---
container.register(UC_TOKENS.StartChallenge, { useClass: StartChallengeUseCase });
container.register(UC_TOKENS.VerifyChallenge, { useClass: VerifyChallengeUseCase });
container.register(UC_TOKENS.ChooseId, { useClass: ChooseIdUseCase });

// --- Price Match Use Cases ---
container.register(UC_TOKENS.SubmitClaim, { useClass: SubmitClaimUseCase });
container.register(UC_TOKENS.GetUserClaims, { useClass: GetUserClaimsUseCase });
container.register(UC_TOKENS.GetPriceMatchConfig, { useClass: GetConfigUseCase });
container.register(UC_TOKENS.GetClaimPromoCode, { useClass: GetClaimPromoCodeUseCase });

// --- Payment Use Cases ---
container.register(UC_TOKENS.VerifyAndFulfill, { useClass: VerifyAndFulfillUseCase });
container.register(UC_TOKENS.CapturePayment, { useClass: CapturePaymentUseCase });

// --- Webhook Use Cases ---
container.register(UC_TOKENS.HandleStripeWebhook, { useClass: HandleStripeWebhookUseCase });
container.register(UC_TOKENS.HandlePayPalWebhook, { useClass: HandlePayPalWebhookUseCase });

// --- Guest Use Cases ---
container.register(UC_TOKENS.GetGuestOrder, { useClass: GetGuestOrderUseCase });
container.register(UC_TOKENS.GetGuestOrderKeys, { useClass: GetGuestOrderKeysUseCase });
container.register(UC_TOKENS.RevealGuestKey, { useClass: RevealGuestKeyUseCase });
container.register(UC_TOKENS.CreateGuestSupportTicket, { useClass: CreateGuestSupportTicketUseCase });

// --- Recommendation Use Cases ---
container.register(UC_TOKENS.GetSimilar, { useClass: GetSimilarUseCase });
container.register(UC_TOKENS.GetAlsoViewed, { useClass: GetAlsoViewedUseCase });
container.register(UC_TOKENS.GetBoughtTogether, { useClass: GetBoughtTogetherUseCase });
container.register(UC_TOKENS.GetBatchRecommendations, { useClass: GetBatchRecommendationsUseCase });
container.register(UC_TOKENS.GetPersonalized, { useClass: GetPersonalizedUseCase });
container.register(UC_TOKENS.GetPopular, { useClass: GetPopularUseCase });
container.register(UC_TOKENS.GetLatestReleases, { useClass: GetLatestReleasesUseCase });
container.register(UC_TOKENS.GetPreOrders, { useClass: GetPreOrdersUseCase });

// --- Search Use Cases ---
container.register(UC_TOKENS.Search, { useClass: SearchUseCase });
container.register(UC_TOKENS.MerchandisedSearch, { useClass: MerchandisedSearchUseCase });

// --- Additional Use Cases ---
container.register(UC_TOKENS.ExchangeGuestSession, { useClass: ExchangeGuestSessionUseCase });
container.register(UC_TOKENS.ConvertCartPrices, { useClass: ConvertCartPricesUseCase });
container.register(UC_TOKENS.LogAccessAttempt, { useClass: LogAccessAttemptUseCase });

export { container };
