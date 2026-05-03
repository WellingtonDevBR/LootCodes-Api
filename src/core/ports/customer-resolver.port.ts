/**
 * Resolves or creates a provider-side customer object so that the
 * PaymentIntent can be bound to it.  Required for off-session re-use
 * (e.g. card-challenge micro-authorisations).
 *
 * Only payment providers that support customer objects (Stripe) need a
 * concrete adapter.  The checkout use case treats absence of the port as
 * "customer resolution not available" and continues without one.
 */
export interface ICustomerResolver {
  /**
   * Look up a cached Stripe customer ID from the user's profile.
   * Returns `null` for guest checkouts or when no cached ID exists.
   */
  getCachedCustomerId(userId: string): Promise<string | null>;

  /** Look up an existing customer by email.  Returns `null` if none found. */
  lookupCustomer(email: string): Promise<string | null>;

  /** Create a new customer and return the provider customer ID. */
  createCustomer(params: {
    email: string;
    name?: string | null;
    metadata?: Record<string, string>;
  }): Promise<string>;

  /** Persist the customer ID on the user's profile for future checkouts. */
  cacheCustomerId(userId: string, customerId: string): Promise<void>;
}
