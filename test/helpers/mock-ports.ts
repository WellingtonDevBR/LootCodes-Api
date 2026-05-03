import type { IDatabase } from '../../src/core/ports/database.port.js';
import type { IAuthProvider, AuthUser, SignInResult, SignUpResult } from '../../src/core/ports/auth.port.js';
import type { IEmailSender, EmailMessage } from '../../src/core/ports/email.port.js';
import type { IEventBus, DomainEvent, DomainEventHandler } from '../../src/core/ports/event-bus.port.js';
import type { IRecaptchaVerifier, RecaptchaAssessment } from '../../src/core/ports/recaptcha.port.js';
import type { IUserRepository } from '../../src/core/ports/user-repository.port.js';
import type { IRateLimiter, RateLimitConfig, RateLimitCheckResult } from '../../src/core/ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../src/core/ports/ip-blocklist.port.js';
import type { IUserProfileRepository } from '../../src/core/ports/user-profile-repository.port.js';
import type { IAvatarStorage } from '../../src/core/ports/avatar-storage.port.js';
import type { ISessionRepository } from '../../src/core/ports/session-repository.port.js';
import type { IOrderRepository } from '../../src/core/ports/order-repository.port.js';
import type { IProductKeyRepository } from '../../src/core/ports/product-key-repository.port.js';
import type { IOrderAccessTokenRepository } from '../../src/core/ports/order-access-token-repository.port.js';
import type { IPaymentGateway, PaymentStatus } from '../../src/core/ports/payment-gateway.port.js';
import type { IPaymentProvider, PaymentIntent, CreatePaymentIntentParams } from '../../src/core/ports/payment-provider.port.js';
import type { ICheckoutRepository, CreateOrderParams } from '../../src/core/ports/checkout-repository.port.js';
import type { IPromoCodeValidator, PromoValidateContext } from '../../src/core/ports/promo-code-validator.port.js';
import type { ICartValidator } from '../../src/core/ports/cart-validator.port.js';
import type { ISupportTicketRepository } from '../../src/core/ports/support-ticket-repository.port.js';
import type { IAttachmentStorage } from '../../src/core/ports/attachment-storage.port.js';
import type { IUserLibraryRepository } from '../../src/core/ports/user-library-repository.port.js';
import type { INotificationRepository } from '../../src/core/ports/notification-repository.port.js';
import type { INotificationPreferencesRepository } from '../../src/core/ports/notification-preferences-repository.port.js';
import type { IPushTokenRepository } from '../../src/core/ports/push-token-repository.port.js';
import type { IReviewRepository } from '../../src/core/ports/review-repository.port.js';
import type { IProductRepository } from '../../src/core/ports/product-repository.port.js';
import type { IReferenceDataRepository } from '../../src/core/ports/reference-data-repository.port.js';
import type { IStockNotificationRepository } from '../../src/core/ports/stock-notification-repository.port.js';
import type { IAnalyticsRepository } from '../../src/core/ports/analytics-repository.port.js';
import type { IGeoService } from '../../src/core/ports/geo-service.port.js';
import type { IWalletRepository } from '../../src/core/ports/wallet-repository.port.js';
import type { IReferralRepository } from '../../src/core/ports/referral-repository.port.js';
import type { INewsletterRepository } from '../../src/core/ports/newsletter-repository.port.js';
import type { ISecurityHoldRepository } from '../../src/core/ports/security-hold-repository.port.js';
import type { IVerificationStorage } from '../../src/core/ports/verification-storage.port.js';
import type { ICardChallengeRepository } from '../../src/core/ports/card-challenge-repository.port.js';
import type { IMicroAuthProvider, MicroAuthResult } from '../../src/core/ports/micro-auth-provider.port.js';
import type { IPriceMatchRepository } from '../../src/core/ports/price-match-repository.port.js';
import type { IPaymentVerifier } from '../../src/core/ports/payment-verifier.port.js';
import type { IRiskAssessor } from '../../src/core/ports/risk-assessor.port.js';
import type { IFulfillmentService } from '../../src/core/ports/fulfillment-service.port.js';
import type { IPaymentCapturer } from '../../src/core/ports/payment-capturer.port.js';
import type { IWebhookVerifier } from '../../src/core/ports/webhook-verifier.port.js';
import type { IWebhookHandler } from '../../src/core/ports/webhook-handler.port.js';
import type { IGuestSessionRepository, GuestSession } from '../../src/core/ports/guest-session.port.js';
import type { ICategoryRepository } from '../../src/core/ports/category-repository.port.js';
import type { IPricingRepository } from '../../src/core/ports/pricing-repository.port.js';
import type { IGeoRestrictionRepository } from '../../src/core/ports/geo-restriction-repository.port.js';
import type { IRecommendationRepository } from '../../src/core/ports/recommendation-repository.port.js';
import type { ISearchProvider } from '../../src/core/ports/search-provider.port.js';
import type {
  IVerificationCodeService,
  GenerateCodeResult,
  VerificationAction,
} from '../../src/core/ports/verification-code.port.js';
import type { Category, LocalizedPrice, ExcludedCountry, RestrictedVariant, RestrictedRegion, PlatformNavItem, PlatformFamily, RecommendedProduct, PopularProduct, RecommendationsBatch } from '../../src/core/use-cases/products/product.types.js';
import type { SearchResult } from '../../src/core/use-cases/search/search.types.js';

import type { UserProfile, UpsertProfileDto, UserSession, UpsertSessionDto } from '../../src/core/use-cases/profile/profile.types.js';
import type { Order, OrderItem, OrderDetail, ProductKey, KeyViewLog, KeyAccessAttemptLog, OrderAccessToken, PaginationParams, UserOrderWithRelations } from '../../src/core/use-cases/orders/order.types.js';
import type {
  CartItem,
  PromoValidationResult,
  PaymentMethodsConfig,
  StockCheckResult as CheckoutStockResult,
} from '../../src/core/use-cases/checkout/checkout.types.js';
import type { SupportTicket, SupportTicketWithMessages, TicketMessage, TicketDetail, CreateTicketDto, TicketFeedbackDto } from '../../src/core/use-cases/support/support.types.js';
import type { LibraryEntry, LibraryProductDetails, SetLibraryStatusDto, UpdateLibraryEntryDto } from '../../src/core/use-cases/library/library.types.js';
import type { Notification, NotificationPreferences, UpdatePreferencesDto } from '../../src/core/use-cases/notifications/notification.types.js';
import type { Review, ProductRating, CreateReviewDto, ReviewEligibility, ReviewPaginationParams } from '../../src/core/use-cases/reviews/review.types.js';
import type { ProductPageData, Product, ProductVariant, GalleryItem, FeaturedProduct, StockCheckItem, StockCheckResult, Platform, Region, Genre, FAQ } from '../../src/core/use-cases/products/product.types.js';
import type { PageViewEvent, ActivityEvent, CartEvent, SessionOutcomeDto, SessionUpsertDto, GeoLookupResult, ProductViewDurationDto, SearchEventDto } from '../../src/core/use-cases/analytics/analytics.types.js';
import type { WalletBalance, WalletLedgerEntry, LedgerPaginationParams, OrderEarnings } from '../../src/core/use-cases/wallet/wallet.types.js';
import type { ReferralMe, ReferralListPage, ReferralLeaderboardEntry, ListReferralsParams, GetLeaderboardParams, OpenDisputeParams, OpenDisputeResult } from '../../src/core/use-cases/referrals/referral.types.js';
import type { NewsletterSubscribeDto, NewsletterResult } from '../../src/core/use-cases/newsletter/newsletter.types.js';
import type { SecurityHold, SecurityHoldStatus, SubmitHoldResponseDto } from '../../src/core/use-cases/security/security.types.js';
import type { CardChallenge, StartChallengeDto, VerifyChallengeDto, VerifyChallengeResult, ChooseIdResult } from '../../src/core/use-cases/card-challenge/card-challenge.types.js';
import type { PriceMatchClaim, PriceMatchClaimSubmission, PriceMatchClaimResult, PriceMatchConfig } from '../../src/core/use-cases/price-match/price-match.types.js';
import type { VerifyPaymentDto, ProviderPaymentStatus, RiskAssessment, RiskAssessmentInput, FulfillmentResult, CapturePaymentDto, CaptureResult, WebhookEvent, WebhookProcessResult } from '../../src/core/use-cases/payments/payment.types.js';

// ─── Infrastructure ──────────────────────────────────────────────

export class MockDatabase implements IDatabase {
  async query<T>(): Promise<T[]> { return [] as T[]; }
  async queryOne<T>(): Promise<T | null> { return null; }
  async insert<T>(_table: string, data: Record<string, unknown>): Promise<T> { return data as T; }
  async update<T>(): Promise<T[]> { return [] as T[]; }
  async upsert<T>(_table: string, data: Record<string, unknown>): Promise<T> { return data as T; }
  async delete(): Promise<number> { return 0; }
  async rpc<T>(): Promise<T> { return null as T; }
}

export class MockAuthProvider implements IAuthProvider {
  public users = new Map<string, AuthUser>();
  public credentials = new Map<string, { password: string; user: AuthUser }>();

  addUser(email: string, password: string, user: AuthUser) {
    this.users.set(user.id, user);
    this.credentials.set(email, { password, user });
  }

  async signInWithPassword(email: string, password: string): Promise<SignInResult> {
    const cred = this.credentials.get(email);
    if (!cred || cred.password !== password) throw new Error('Invalid credentials');
    return {
      user: cred.user,
      session: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', expires_in: 3600, token_type: 'bearer', user: cred.user },
    };
  }

  async signUp(email: string, _password: string, metadata?: Record<string, unknown>): Promise<SignUpResult> {
    const user: AuthUser = { id: 'new-user-id', email, user_metadata: metadata };
    return { user, session: null };
  }

  async getUserById(userId: string): Promise<AuthUser | null> { return this.users.get(userId) ?? null; }
  async getUserByToken(_token: string): Promise<AuthUser | null> { return this.users.values().next().value ?? null; }
  async resetPasswordForEmail(): Promise<void> {}
  async updateUser(userId: string, attributes: Record<string, unknown>): Promise<AuthUser> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    return { ...user, ...attributes };
  }
  async sendOtp(): Promise<void> {}
  async verifyOtp(_phone: string, _token: string): Promise<SignInResult> {
    return { user: { id: 'otp-user', phone: _phone }, session: { access_token: 'mock-otp-token', refresh_token: 'mock-otp-refresh', expires_in: 3600, token_type: 'bearer', user: { id: 'otp-user', phone: _phone } } };
  }
}

export class MockEmailSender implements IEmailSender {
  public sent: EmailMessage[] = [];
  async send(message: EmailMessage): Promise<{ id: string }> { this.sent.push(message); return { id: `mock-email-${this.sent.length}` }; }
}

export class MockEventBus implements IEventBus {
  public emitted: DomainEvent[] = [];
  private handlers = new Map<string, DomainEventHandler[]>();
  async emit(event: DomainEvent): Promise<void> { this.emitted.push(event); for (const h of this.handlers.get(event.eventType) ?? []) { await h(event); } }
  subscribe(eventType: string, handler: DomainEventHandler): void { const e = this.handlers.get(eventType) ?? []; e.push(handler); this.handlers.set(eventType, e); }
}

export class MockRecaptchaVerifier implements IRecaptchaVerifier {
  public shouldPass = true;
  public mockScore = 0.9;
  async assess(): Promise<RecaptchaAssessment> { return { valid: this.shouldPass, score: this.mockScore, reasons: this.shouldPass ? [] : ['mock_failure'] }; }
}

export class MockUserRepository implements IUserRepository {
  private emailToId = new Map<string, string>();
  setUser(email: string, id: string) { this.emailToId.set(email, id); }
  async findIdByEmail(email: string): Promise<string | null> { return this.emailToId.get(email) ?? null; }
}

export class MockRateLimiter implements IRateLimiter {
  public shouldAllow = true;
  public mockConfig: RateLimitConfig = { perIpHourly: 30, perUnknownIpHourly: 5 };
  async getConfig(): Promise<RateLimitConfig> { return this.mockConfig; }
  async check(): Promise<RateLimitCheckResult> { return { allowed: this.shouldAllow }; }
}

export class MockIpBlocklist implements IIpBlocklist {
  public blockedIps = new Set<string>();
  block(ip: string) { this.blockedIps.add(ip); }
  async isBlocked(ipAddress: string): Promise<boolean> { return this.blockedIps.has(ipAddress); }
}

export class MockVerificationCodeService implements IVerificationCodeService {
  public verifyReturns = true;

  async generate(
    _email: string,
    _action: VerificationAction,
    _ipAddress: string,
    _requestId: string,
    _expiresInMinutes?: number,
  ): Promise<GenerateCodeResult> {
    return { code: '123456', expiresAt: new Date(Date.now() + 600_000) };
  }

  async verify(
    _email: string,
    _action: VerificationAction,
    code: string,
    _ipAddress: string,
    _requestId: string,
  ): Promise<boolean> {
    return this.verifyReturns && code === '123456';
  }
}

// ─── Profile ─────────────────────────────────────────────────────

export class MockUserProfileRepository implements IUserProfileRepository {
  public profiles = new Map<string, UserProfile>();
  setProfile(userId: string, profile: UserProfile) { this.profiles.set(userId, profile); }
  async getProfile(userId: string): Promise<UserProfile | null> { return this.profiles.get(userId) ?? null; }
  async upsertProfile(userId: string, data: UpsertProfileDto): Promise<UserProfile> {
    const existing = this.profiles.get(userId) ?? { id: `profile-${userId}`, user_id: userId };
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.profiles.set(userId, updated);
    return updated;
  }
  async deleteProfile(userId: string): Promise<void> { this.profiles.delete(userId); }
  async restoreProfile(userId: string): Promise<void> {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, { id: `profile-${userId}`, user_id: userId });
    }
  }
  async checkDeleted(userId: string): Promise<boolean> { return !this.profiles.has(userId); }
  async getRole(_userId: string): Promise<string | null> { return 'user'; }
}

export class MockAvatarStorage implements IAvatarStorage {
  async upload(userId: string): Promise<string> { return `https://mock-storage.com/avatars/${userId}.jpg`; }
  async getUrl(userId: string): Promise<string | null> { return `https://mock-storage.com/avatars/${userId}.jpg`; }
  async delete(): Promise<void> {}
}

export class MockSessionRepository implements ISessionRepository {
  public sessions: UserSession[] = [];
  async upsert(params: UpsertSessionDto): Promise<UserSession> {
    const session: UserSession = { id: params.session_id, user_id: params.user_id, ip_address: params.ip_address, user_agent: params.user_agent, client_channel: params.client_channel, started_at: new Date().toISOString() };
    this.sessions.push(session);
    return session;
  }
  async getActiveSessions(_userId: string): Promise<UserSession[]> { return this.sessions; }
  async terminate(sessionId: string): Promise<void> { this.sessions = this.sessions.filter(s => s.id !== sessionId); }
}

// ─── Orders ──────────────────────────────────────────────────────

export class MockOrderRepository implements IOrderRepository {
  public orders: Order[] = [];
  addOrder(order: Order) { this.orders.push(order); }
  async findById(orderId: string): Promise<Order | null> { return this.orders.find(o => o.id === orderId) ?? null; }
  async findByUserId(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    const result = this.orders.filter(o => o.user_id === userId);
    return result.slice(pagination?.offset ?? 0, (pagination?.offset ?? 0) + (pagination?.limit ?? 20));
  }
  async getOrderItems(_orderId: string): Promise<OrderItem[]> { return []; }
  async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    const order = this.orders.find(o => o.id === orderId);
    return order ? { order, items: [] } : null;
  }
  async findByUserForSupport(userId: string): Promise<Order[]> { return this.orders.filter(o => o.user_id === userId); }
  async findByUserIdWithRelations(userId: string, pagination?: PaginationParams): Promise<UserOrderWithRelations[]> { return []; }
  async getOrderAccessDetail(_orderId: string): Promise<import('../../src/core/use-cases/orders/order.types.js').OrderAccessResponse | null> { return null; }
  async getKeyViewLogs(_orderId: string, _keyIds: string[]): Promise<Array<{ key_id: string; viewed_at: string }>> { return []; }
  async getOrderAccessTokenMetadata(_token: string, _orderId: string): Promise<import('../../src/core/use-cases/orders/order.types.js').OrderAccessTokenMetadata | null> { return null; }
}

export class MockProductKeyRepository implements IProductKeyRepository {
  public keys: ProductKey[] = [];
  async getKeysForOrder(_orderId: string, _userId: string): Promise<ProductKey[]> { return this.keys; }
  async getKeysForOrderItem(_orderItemId: string): Promise<ProductKey[]> { return this.keys; }
  async decryptKey(_keyId: string): Promise<string> { return 'DECRYPTED-KEY-VALUE'; }
  async logKeyView(_log: KeyViewLog): Promise<void> {}
  async checkKeyViewed(_keyId: string, _orderId: string, _userId: string): Promise<boolean> { return false; }
  async logAccessAttempt(_params: KeyAccessAttemptLog): Promise<void> {}
}

export class MockOrderAccessTokenRepository implements IOrderAccessTokenRepository {
  public tokens: OrderAccessToken[] = [];
  async validate(token: string, orderId: string): Promise<OrderAccessToken | null> {
    return this.tokens.find(t => t.token === token && t.order_id === orderId) ?? null;
  }
  async generate(orderId: string, email: string): Promise<OrderAccessToken> {
    const t: OrderAccessToken = { token: `token-${orderId}`, order_id: orderId, email, expires_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() };
    this.tokens.push(t);
    return t;
  }
  async refresh(token: string): Promise<OrderAccessToken> {
    const existing = this.tokens.find(t => t.token === token);
    if (!existing) throw new Error('Token not found');
    return { ...existing, expires_at: new Date(Date.now() + 86400000).toISOString() };
  }
  async claimToUser(_token: string, _userId: string): Promise<void> {}
}

export class MockPaymentGateway implements IPaymentGateway {
  public paymentStatus: PaymentStatus = { paid: true, status: 'succeeded', amount_cents: 2999, currency: 'usd' };
  async verifyPayment(_paymentIntentId: string): Promise<PaymentStatus> { return this.paymentStatus; }
  async getPaymentStatus(_orderId: string): Promise<PaymentStatus> { return this.paymentStatus; }
}

// ─── Checkout ────────────────────────────────────────────────────

export class MockPaymentProvider implements IPaymentProvider {
  private piSeq = 0;
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    this.piSeq += 1;
    return {
      id: `pi_mock_${this.piSeq}`,
      client_secret: 'pi_mock_secret',
      status: 'requires_payment_method',
      amount_cents: params.amount_cents,
      currency: params.currency,
    };
  }
  async confirmPayment(_intentId: string): Promise<PaymentIntent> {
    return { id: 'pi_mock', client_secret: 'pi_mock_secret', status: 'succeeded', amount_cents: 2999, currency: 'usd' };
  }
  async cancelPayment(_intentId: string): Promise<void> {}
  async getPaymentIntent(_intentId: string): Promise<PaymentIntent> {
    return { id: 'pi_mock', client_secret: 'pi_mock_secret', status: 'succeeded', amount_cents: 2999, currency: 'usd' };
  }
}

export class MockCheckoutRepository implements ICheckoutRepository {
  public orders: Record<string, Record<string, unknown>> = {};

  async createOrder(params: CreateOrderParams): Promise<{ id: string; order_number: string | null }> {
    const id = `order-${Date.now()}`;
    const order_number = `ORD-${id.slice(-8)}`;
    this.orders[id] = { ...params, id, order_number };
    return { id, order_number };
  }

  async replaceOrderItems(_orderId: string, _items: CartItem[]): Promise<void> {}

  async updateOrder(orderId: string, data: Record<string, unknown>): Promise<void> {
    this.orders[orderId] = { ...(this.orders[orderId] ?? {}), ...data };
  }

  async cancelOrder(orderId: string): Promise<void> {
    delete this.orders[orderId];
  }

  async getOrder(orderId: string): Promise<Record<string, unknown> | null> {
    return this.orders[orderId] ?? null;
  }

  async getPaymentMethodsConfig(): Promise<PaymentMethodsConfig> {
    return {
      stripe: {
        card_enabled: true,
        apple_pay_enabled: true,
        google_pay_enabled: true,
      },
      paypal: {
        smart_buttons_enabled: true,
        pay_later_enabled: true,
        credit_enabled: true,
        card_fields_enabled: false,
      },
    };
  }
}

export class MockPromoCodeValidator implements IPromoCodeValidator {
  public validCodes = new Map<string, PromoValidationResult>();
  async validate(code: string, _items: CartItem[], _ctx?: PromoValidateContext): Promise<PromoValidationResult> {
    return this.validCodes.get(code) ?? { valid: false, discount_cents: 0, message: 'Invalid promo code' };
  }
  async recordUsage(): Promise<void> {}
}

export class MockCartValidator implements ICartValidator {
  public stockResults: CheckoutStockResult[] = [];
  async validateItems(_items: CartItem[]): Promise<void> {}
  async checkStock(_items: CartItem[]): Promise<CheckoutStockResult[]> { return this.stockResults; }
}

// ─── Support ─────────────────────────────────────────────────────

export class MockSupportTicketRepository implements ISupportTicketRepository {
  public tickets: TicketDetail[] = [];
  async create(params: CreateTicketDto & { user_id?: string }): Promise<SupportTicket> {
    const ticket: SupportTicket = { id: `ticket-${Date.now()}`, ticket_number: `T-${Date.now()}`, user_id: params.user_id, subject: params.subject, status: 'open', created_at: new Date().toISOString() };
    this.tickets.push({ ticket, messages: [{ id: `msg-${Date.now()}`, ticket_id: ticket.id, sender_type: 'customer', message: params.message, created_at: new Date().toISOString() }] });
    return ticket;
  }
  async findByNumber(ticketNumber: string): Promise<TicketDetail | null> { return this.tickets.find(t => t.ticket.ticket_number === ticketNumber) ?? null; }
  async findByUserId(userId: string): Promise<SupportTicket[]> { return this.tickets.filter(t => t.ticket.user_id === userId).map(t => t.ticket); }
  async findByUserIdWithMessages(userId: string): Promise<SupportTicketWithMessages[]> { return this.tickets.filter(t => t.ticket.user_id === userId).map(t => ({ ...t.ticket, ticket_messages: t.messages.map(m => ({ created_at: m.created_at! })) })); }
  async addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'created_at'>): Promise<TicketMessage> {
    const msg: TicketMessage = { ...message, id: `msg-${Date.now()}`, created_at: new Date().toISOString() };
    const detail = this.tickets.find(t => t.ticket.id === ticketId);
    if (detail) detail.messages.push(msg);
    return msg;
  }
  async updateStatus(ticketId: string, status: string): Promise<void> {
    const detail = this.tickets.find(t => t.ticket.id === ticketId);
    if (detail) detail.ticket.status = status;
  }
  async submitFeedback(_ticketId: string, _feedback: TicketFeedbackDto): Promise<void> {}
  async getVerificationTicketsForOrder(_orderId: string): Promise<SupportTicket[]> { return []; }
  async findVerificationTicketForOrder(_orderId: string, _ticketTypes: string[]): Promise<SupportTicket | null> { return null; }
}

export class MockAttachmentStorage implements IAttachmentStorage {
  async upload(_ticketId: string, _fileBuffer: Buffer, fileName: string): Promise<string> { return `https://mock-storage.com/attachments/${fileName}`; }
  async getSignedUrl(path: string): Promise<string> { return `https://mock-storage.com/signed/${path}`; }
}

// ─── Library ─────────────────────────────────────────────────────

export class MockUserLibraryRepository implements IUserLibraryRepository {
  public entries: LibraryEntry[] = [];
  async list(userId: string): Promise<LibraryEntry[]> { return this.entries.filter(e => e.user_id === userId); }
  async setStatus(userId: string, dto: SetLibraryStatusDto): Promise<LibraryEntry> {
    const entry: LibraryEntry = { id: `lib-${Date.now()}`, user_id: userId, product_id: dto.product_id, status: dto.status, source: dto.source ?? 'manual', created_at: new Date().toISOString() };
    this.entries.push(entry);
    return entry;
  }
  async remove(userId: string, productId: string): Promise<void> { this.entries = this.entries.filter(e => !(e.user_id === userId && e.product_id === productId)); }
  async update(_userId: string, _productId: string, _data: UpdateLibraryEntryDto): Promise<void> {}
  async getProductDetails(_productIds: string[]): Promise<LibraryProductDetails[]> { return []; }
}

// ─── Notifications ───────────────────────────────────────────────

export class MockNotificationRepository implements INotificationRepository {
  public notifications: Notification[] = [];
  async list(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    return this.notifications.filter(n => n.user_id === userId).slice(offset ?? 0, (offset ?? 0) + (limit ?? 20));
  }
  async getUnreadCount(userId: string): Promise<number> { return this.notifications.filter(n => n.user_id === userId && !n.read).length; }
  async markRead(notificationId: string): Promise<void> {
    const n = this.notifications.find(x => x.id === notificationId);
    if (n) n.read = true;
  }
  async markAllRead(userId: string): Promise<void> { this.notifications.filter(n => n.user_id === userId).forEach(n => { n.read = true; }); }
}

export class MockNotificationPreferencesRepository implements INotificationPreferencesRepository {
  public prefs = new Map<string, NotificationPreferences>();
  async get(userId: string): Promise<NotificationPreferences | null> { return this.prefs.get(userId) ?? null; }
  async update(userId: string, data: UpdatePreferencesDto): Promise<NotificationPreferences> {
    const existing = this.prefs.get(userId) ?? { user_id: userId, orders: true, promotions: true, stock_alerts: true, support: true, security: true };
    const updated = { ...existing, ...data };
    this.prefs.set(userId, updated);
    return updated;
  }
}

export class MockPushTokenRepository implements IPushTokenRepository {
  public tokens: Array<{ userId: string; token: string; platform: string }> = [];
  async register(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void> { this.tokens.push({ userId, token, platform }); }
  async remove(userId: string, token: string): Promise<void> { this.tokens = this.tokens.filter(t => !(t.userId === userId && t.token === token)); }
}

// ─── Reviews ─────────────────────────────────────────────────────

export class MockReviewRepository implements IReviewRepository {
  public reviews: Review[] = [];
  async listByProduct(productId: string, pagination?: ReviewPaginationParams): Promise<Review[]> {
    return this.reviews.filter(r => r.product_id === productId).slice(pagination?.offset ?? 0, (pagination?.offset ?? 0) + (pagination?.limit ?? 20));
  }
  async getRating(productId: string): Promise<ProductRating> {
    const productReviews = this.reviews.filter(r => r.product_id === productId);
    const count = productReviews.length;
    const average = count > 0 ? productReviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    return { average, count };
  }
  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const review: Review = { id: `review-${Date.now()}`, product_id: dto.product_id, user_id: userId, rating: dto.rating, title: dto.title, body: dto.body, verified_purchase: true, created_at: new Date().toISOString() };
    this.reviews.push(review);
    return review;
  }
  async checkEligibility(_userId: string, _productId: string): Promise<ReviewEligibility> { return { eligible: true }; }
}

// ─── Products ────────────────────────────────────────────────────

export class MockProductRepository implements IProductRepository {
  public products: Product[] = [];
  public variants: ProductVariant[] = [];

  async findBySlugRaw(slug: string): Promise<Record<string, unknown> | null> {
    const product = this.products.find((p) => p.slug === slug);
    if (!product) return null;
    const variants = this.variants.filter((v) => v.product_id === product.id);
    const key_counts: Record<string, number> = {};
    for (const v of variants) {
      key_counts[v.id] = 1;
    }
    const variantRecords = variants.map((v) => ({
      id: v.id,
      slug: v.id,
      product_id: v.product_id,
      region_id: v.region_id ?? 'r-mock',
      price_usd: v.price_usd,
      retail_price_usd: v.retail_price_usd,
      is_active: true,
      purchasable: true,
      platforms: [],
    }));
    return {
      ...product,
      variants: variantRecords,
      key_counts,
      gallery: [],
      matched_variant_id: null,
    };
  }

  async findBySlug(slug: string): Promise<ProductPageData | null> {
    const product = this.products.find(p => p.slug === slug);
    return product ? { product, variants: this.variants.filter(v => v.product_id === product.id) } : null;
  }
  async findById(id: string): Promise<Product | null> { return this.products.find(p => p.id === id) ?? null; }
  async getVariants(productId: string): Promise<ProductVariant[]> { return this.variants.filter(v => v.product_id === productId); }
  async checkStock(_variantId: string, _quantity: number): Promise<boolean> { return true; }
  async batchCheckStock(items: StockCheckItem[]): Promise<StockCheckResult[]> {
    return items.map(i => ({ variant_id: i.variant_id, available: true, available_quantity: i.quantity }));
  }
  async getGallery(_productId: string): Promise<GalleryItem[]> { return []; }
  async getFeatured(): Promise<FeaturedProduct[]> { return []; }
  async isVariantPurchasable(_variantId: string, _quantity: number): Promise<{ purchasable: boolean; reason?: string }> {
    return { purchasable: true };
  }
  async getActivePromoHeader(): Promise<{ code: string; message: string; discount_text: string; expires_at: string } | null> {
    return null;
  }
  async getTrustpilotData(): Promise<{ score: number; reviews_count: number; stars: number } | null> {
    return null;
  }
}

export class MockReferenceDataRepository implements IReferenceDataRepository {
  async getPlatforms(): Promise<Platform[]> { return [{ id: 'p1', name: 'PC', code: 'pc' }]; }
  async getRegions(): Promise<Region[]> { return [{ id: 'r1', name: 'Global', code: 'global' }]; }
  async getGenres(): Promise<Genre[]> { return [{ id: 'g1', name: 'Action', slug: 'action' }]; }
  async getFAQs(): Promise<FAQ[]> { return []; }
  async findPlatformBySlug(slug: string): Promise<Platform | null> { return slug === 'pc' ? { id: 'p1', name: 'PC', code: 'pc', slug: 'pc' } : null; }
  async getPlatformNavItems(): Promise<PlatformNavItem[]> { return [{ id: 'p1', name: 'PC', slug: 'pc', code: 'pc' }]; }
  async findPlatformFamilyBySlug(_slug: string): Promise<PlatformFamily | null> { return null; }
}

export class MockStockNotificationRepository implements IStockNotificationRepository {
  public subscriptions = new Set<string>();
  async subscribe(_userId: string, variantId: string): Promise<void> { this.subscriptions.add(variantId); }
  async unsubscribe(_userId: string, variantId: string): Promise<void> { this.subscriptions.delete(variantId); }
  async isSubscribed(_userId: string, variantId: string): Promise<boolean> { return this.subscriptions.has(variantId); }
}

// ─── Analytics ───────────────────────────────────────────────────

export class MockAnalyticsRepository implements IAnalyticsRepository {
  public pageViews: PageViewEvent[] = [];
  public activityEvents: ActivityEvent[] = [];
  public cartEvents: CartEvent[] = [];
  public outcomes: SessionOutcomeDto[] = [];
  async insertPageViews(events: PageViewEvent[]): Promise<void> { this.pageViews.push(...events); }
  async insertActivityEvents(events: ActivityEvent[]): Promise<void> { this.activityEvents.push(...events); }
  async insertCartEvent(event: CartEvent): Promise<void> { this.cartEvents.push(event); }
  async updateSessionOutcome(dto: SessionOutcomeDto): Promise<void> { this.outcomes.push(dto); }
  async trackProductViewDuration(_data: ProductViewDurationDto & { user_id?: string }): Promise<void> { return; }
  async trackSearchEvent(_data: SearchEventDto): Promise<void> { return; }
  async upsertSession(_dto: SessionUpsertDto): Promise<void> { return; }
}

export class MockGeoService implements IGeoService {
  async lookupIp(_ipAddress: string): Promise<GeoLookupResult> { return { country_code: 'US', country_name: 'United States' }; }
}

// ─── Wallet ──────────────────────────────────────────────────────

export class MockWalletRepository implements IWalletRepository {
  public balance: WalletBalance = { balance_cents: 0, lifetime_credited_cents: 0, lifetime_redeemed_cents: 0, expiring_soon_cents: 0, next_expiry: null };
  public ledgerEntries: WalletLedgerEntry[] = [];
  public orderEarnings: OrderEarnings[] = [];
  public nextCursor: string | null = null;

  async getBalance(_userId: string): Promise<WalletBalance> { return this.balance; }
  async listLedger(_userId: string, params?: LedgerPaginationParams): Promise<{ entries: WalletLedgerEntry[]; nextCursor: string | null }> {
    const limit = params?.limit ?? 20;
    return { entries: this.ledgerEntries.slice(0, limit), nextCursor: this.nextCursor };
  }
  async getOrderEarnings(_userId: string, _orderIds: string[]): Promise<OrderEarnings[]> { return this.orderEarnings; }
  async claimReviewReward(_userId: string, _reviewId: string): Promise<{ credited: boolean; amount_cents: number }> {
    return { credited: true, amount_cents: 100 };
  }
  async getPurchaseRewardConfig(): Promise<unknown> { return {}; }
  async getVariantEarnBonuses(_variantIds: string[]): Promise<unknown> { return []; }
}

// ─── Referrals ───────────────────────────────────────────────────

export class MockReferralRepository implements IReferralRepository {
  public meData = new Map<string, ReferralMe>();
  public referralPages = new Map<string, ReferralListPage>();
  public leaderboard: ReferralLeaderboardEntry[] = [];
  public disputeResult: OpenDisputeResult = { ok: true };
  public lastLeaderboardParams?: GetLeaderboardParams;
  public lastDisputeParams?: OpenDisputeParams;

  async getMe(userId: string): Promise<ReferralMe | null> { return this.meData.get(userId) ?? null; }
  async listReferrals(userId: string, _params?: ListReferralsParams): Promise<ReferralListPage> {
    return this.referralPages.get(userId) ?? { entries: [], nextCursor: null, role: 'referrer' };
  }
  async getLeaderboard(params?: GetLeaderboardParams): Promise<ReferralLeaderboardEntry[]> {
    this.lastLeaderboardParams = params;
    return this.leaderboard;
  }
  async openDispute(_userId: string, params: OpenDisputeParams): Promise<OpenDisputeResult> {
    this.lastDisputeParams = params;
    return { ...this.disputeResult, referral_id: params.referral_id };
  }
}

// ─── Newsletter ──────────────────────────────────────────────────

export class MockNewsletterRepository implements INewsletterRepository {
  public result: NewsletterResult = { success: true };
  async subscribe(_params: NewsletterSubscribeDto): Promise<NewsletterResult> { return this.result; }
  async confirm(_token: string): Promise<NewsletterResult> { return this.result; }
  async unsubscribe(_token: string): Promise<NewsletterResult> { return this.result; }
}

// ─── Security ────────────────────────────────────────────────────

export class MockSecurityHoldRepository implements ISecurityHoldRepository {
  public holds = new Map<string, SecurityHold>();
  public rateLimited = false;
  public resolveResult: { success: boolean; error?: string } = { success: true };

  addHold(hold: SecurityHold) { this.holds.set(hold.id, hold); }
  async findById(holdId: string): Promise<SecurityHold | null> { return this.holds.get(holdId) ?? null; }
  async getStatus(holdId: string): Promise<SecurityHoldStatus | null> { return this.holds.get(holdId)?.status ?? null; }
  async submitResponse(_holdId: string, _dto: SubmitHoldResponseDto): Promise<void> {}
  async checkRateLimit(_identifier: string, _identifierType: string, _actionType: string): Promise<boolean> { return !this.rateLimited; }
  async recordAttempt(_identifier: string, _identifierType: string, _actionType: string): Promise<void> {}
  async resolveByToken(_token: string): Promise<{ success: boolean; error?: string }> { return this.resolveResult; }
  async createHold(_params: import('../../src/core/ports/security-hold-repository.port.js').CreateSecurityHoldParams): Promise<{ id: string }> { return { id: `hold-${Date.now()}` }; }
}

export class MockVerificationStorage implements IVerificationStorage {
  async upload(path: string, _fileBuffer: Buffer, _contentType: string): Promise<string> { return `https://mock-storage.com/verification/${path}`; }
}

// ─── Card Challenge ──────────────────────────────────────────────

export class MockCardChallengeRepository implements ICardChallengeRepository {
  public challenges = new Map<string, CardChallenge>();

  addChallenge(challenge: CardChallenge) { this.challenges.set(challenge.id, challenge); }
  setStatus(challengeId: string, status: CardChallenge['status']) {
    const c = this.challenges.get(challengeId);
    if (c) this.challenges.set(challengeId, { ...c, status });
  }
  async findById(challengeId: string): Promise<CardChallenge | null> { return this.challenges.get(challengeId) ?? null; }
  async findByOrderId(orderId: string): Promise<CardChallenge | null> {
    for (const c of this.challenges.values()) { if (c.order_id === orderId) return c; }
    return null;
  }
  async create(dto: StartChallengeDto): Promise<CardChallenge> {
    const challenge: CardChallenge = { id: `challenge-${Date.now()}`, order_id: dto.order_id, status: 'pending', attempts: 0, max_attempts: 3, created_at: new Date().toISOString() };
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }
  async verify(_challengeId: string, _dto: VerifyChallengeDto): Promise<VerifyChallengeResult> { return { verified: true, attempts_remaining: 2 }; }
  async chooseId(_challengeId: string): Promise<ChooseIdResult> { return { ok: true }; }
  async hasSucceededOrderCardVerification(_orderId: string): Promise<boolean> {
    return false;
  }
}

export class MockMicroAuthProvider implements IMicroAuthProvider {
  async createMicroAuth(_paymentMethodId: string, _customerId?: string): Promise<MicroAuthResult> {
    return { authorization_id: 'auth_mock', amount_cents: 77, currency: 'usd' };
  }
  async verifyAmount(_authorizationId: string, _submittedAmount: number): Promise<boolean> { return true; }
  async cancelAuth(_authorizationId: string): Promise<void> {}
}

// ─── Price Match ─────────────────────────────────────────────────

export class MockPriceMatchRepository implements IPriceMatchRepository {
  public claims: PriceMatchClaim[] = [];
  public config: PriceMatchConfig | null = { enabled: true, max_claims_per_user: 5, max_discount_percent: 20 };
  public promoCodes = new Map<string, string>();

  async submitClaim(_data: PriceMatchClaimSubmission): Promise<PriceMatchClaimResult> {
    return { success: true, claim_id: `claim-${Date.now()}`, expires_at: new Date(Date.now() + 86400000).toISOString() };
  }
  async getUserClaims(_userId: string): Promise<PriceMatchClaim[]> { return this.claims; }
  async getConfig(): Promise<PriceMatchConfig | null> { return this.config; }
  async getClaimPromoCode(promoCodeId: string): Promise<string | null> { return this.promoCodes.get(promoCodeId) ?? null; }
}

// ─── Payment Verification + Capture ──────────────────────────────

export class MockPaymentVerifier implements IPaymentVerifier {
  public result: ProviderPaymentStatus = { status: 'fulfilled', order_id: 'order-123' };
  async verifyPayment(_dto: VerifyPaymentDto): Promise<ProviderPaymentStatus> { return this.result; }
}

export class MockRiskAssessor implements IRiskAssessor {
  public assessment: RiskAssessment = { score: 10, level: 'low', factors: [], should_hold: false, should_block: false };
  async assess(_input: RiskAssessmentInput): Promise<RiskAssessment> { return this.assessment; }
}

export class MockFulfillmentService implements IFulfillmentService {
  public fulfillResult: FulfillmentResult = { fulfilled: true, order_id: 'order-123', keys_delivered: 1 };
  async fulfill(_orderId: string, _riskScore?: number): Promise<FulfillmentResult> { return this.fulfillResult; }
  async holdOrder(_orderId: string, _reason: string, _riskScore: number): Promise<void> {}
}

export class MockPaymentCapturer implements IPaymentCapturer {
  public captureResult: CaptureResult = { captured: true, payment_intent_id: 'pi_mock', amount_cents: 2999, currency: 'usd' };
  async capture(_dto: CapturePaymentDto): Promise<CaptureResult> { return this.captureResult; }
}

// ─── Webhooks ────────────────────────────────────────────────────

export class MockWebhookVerifier implements IWebhookVerifier {
  async verifyStripeSignature(_payload: string, _signature: string): Promise<Record<string, unknown>> {
    return { id: 'evt_mock', type: 'payment_intent.succeeded', data: {} };
  }
  async verifyPayPalSignature(_payload: string, _headers: Record<string, string>): Promise<Record<string, unknown>> {
    return { id: 'PP-mock', event_type: 'CHECKOUT.ORDER.APPROVED', resource: {} };
  }
}

export class MockWebhookHandler implements IWebhookHandler {
  public results: WebhookProcessResult[] = [];
  async processEvent(event: WebhookEvent): Promise<WebhookProcessResult> {
    const result: WebhookProcessResult = { processed: true, event_id: event.id, action_taken: 'mock_action' };
    this.results.push(result);
    return result;
  }
}

// ─── Guest ───────────────────────────────────────────────────────

export class MockGuestSessionRepository implements IGuestSessionRepository {
  public sessions = new Map<string, GuestSession>();

  addSession(token: string, session: GuestSession) { this.sessions.set(token, session); }
  async validateToken(token: string): Promise<GuestSession | null> { return this.sessions.get(token) ?? null; }
  async exchangeToken(rawToken: string): Promise<GuestSession | null> { return this.sessions.get(rawToken) ?? null; }
}

// ─── Categories ─────────────────────────────────────────────────

export class MockCategoryRepository implements ICategoryRepository {
  public categories: Category[] = [{ id: 'cat-1', name: 'Games', slug: 'games' }];
  async listActive(): Promise<Category[]> { return this.categories; }
  async findBySlug(slug: string): Promise<Category | null> { return this.categories.find((c) => c.slug === slug) ?? null; }
  async findSubcategories(_parentId: string): Promise<Category[]> { return []; }
  async findFaqsByCategoryId(_categoryId: string): Promise<FAQ[]> { return []; }
}

// ─── Pricing ────────────────────────────────────────────────────

export class MockPricingRepository implements IPricingRepository {
  async getPrice(_variantId: string, currency: string): Promise<LocalizedPrice | null> {
    return { price_cents: 2999, currency };
  }
  async getBatchPrices(variantIds: string[], currency: string): Promise<Map<string, LocalizedPrice>> {
    const map = new Map<string, LocalizedPrice>();
    for (const id of variantIds) map.set(id, { price_cents: 2999, currency });
    return map;
  }
  async hasPricesForCurrency(_currency: string): Promise<boolean> { return true; }
  async syncRates(): Promise<{ rates?: Record<string, number>; currencies?: string[] } | null> { return null; }
}

// ─── Geo Restrictions ───────────────────────────────────────────

export class MockGeoRestrictionRepository implements IGeoRestrictionRepository {
  async isCountryAllowed(_regionId: string, _countryCode: string): Promise<boolean> { return true; }
  async getExcludedCountries(_regionId: string): Promise<ExcludedCountry[]> { return []; }
  async getRestrictedVariants(_productId: string, _countryCode: string): Promise<RestrictedVariant[]> { return []; }
  async getRestrictedRegions(_countryCode: string): Promise<RestrictedRegion[]> { return []; }
}

// ─── Recommendations ────────────────────────────────────────────

export class MockRecommendationRepository implements IRecommendationRepository {
  async getSimilar(_productId: string, _limit: number): Promise<RecommendedProduct[]> { return []; }
  async getAlsoViewed(_productId: string, _daysBack: number, _limit: number): Promise<RecommendedProduct[]> { return []; }
  async getBoughtTogether(_productId: string, _limit: number): Promise<RecommendedProduct[]> { return []; }
  async getBatch(_productId: string, _sl: number, _avl: number, _btl: number): Promise<RecommendationsBatch> {
    return { similar: [], also_viewed: [], bought_together: [] };
  }
  async getPersonalized(_userId: string | null, _sessionId: string, _limit: number): Promise<RecommendedProduct[]> { return []; }
  async getPopular(_daysBack: number, _limit: number): Promise<PopularProduct[]> { return []; }
  async getLatestReleases(_daysBack: number, _limit: number): Promise<RecommendedProduct[]> { return []; }
  async getPreOrders(_limit: number): Promise<RecommendedProduct[]> { return []; }
}

// ─── Customer Resolver ──────────────────────────────────────────

import type { ICustomerResolver } from '../../src/core/ports/customer-resolver.port.js';

export class MockCustomerResolver implements ICustomerResolver {
  cachedCustomerId: string | null = null;
  lookupResult: string | null = null;
  createdCustomerId = 'cus_test_mock';

  async getCachedCustomerId(_userId: string): Promise<string | null> { return this.cachedCustomerId; }
  async lookupCustomer(_email: string): Promise<string | null> { return this.lookupResult; }
  async createCustomer(_params: { email: string; name?: string | null; metadata?: Record<string, string> }): Promise<string> {
    return this.createdCustomerId;
  }
  async cacheCustomerId(_userId: string, _customerId: string): Promise<void> {}
}

// ─── Payment Provider Factories ─────────────────────────────────

import type {
  IPaymentProviderFactory,
  IPaymentCapturerFactory,
  IPaymentVerifierFactory,
  PaymentProviderName,
} from '../../src/core/ports/payment-provider-factory.port.js';

export class MockPaymentProviderFactory implements IPaymentProviderFactory {
  provider: MockPaymentProvider;

  constructor(provider?: MockPaymentProvider) {
    this.provider = provider ?? new MockPaymentProvider();
  }

  getProvider(_name: PaymentProviderName): IPaymentProvider {
    return this.provider;
  }

  isProviderAvailable(_name: PaymentProviderName): boolean {
    return true;
  }
}

export class MockPaymentCapturerFactory implements IPaymentCapturerFactory {
  capturer: MockPaymentCapturer;

  constructor(capturer?: MockPaymentCapturer) {
    this.capturer = capturer ?? new MockPaymentCapturer();
  }

  getCapturer(_name: PaymentProviderName): IPaymentCapturer {
    return this.capturer;
  }
}

export class MockPaymentVerifierFactory implements IPaymentVerifierFactory {
  verifier: MockPaymentVerifier;

  constructor(verifier?: MockPaymentVerifier) {
    this.verifier = verifier ?? new MockPaymentVerifier();
  }

  getVerifier(_name: PaymentProviderName): IPaymentVerifier {
    return this.verifier;
  }
}

// ─── Search ─────────────────────────────────────────────────────

export class MockSearchProvider implements ISearchProvider {
  async search(query: string): Promise<SearchResult> {
    return { hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 20, query };
  }
  async merchandisedSearch(params: { query: string }): Promise<SearchResult> {
    return { hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 20, query: params.query };
  }
}
