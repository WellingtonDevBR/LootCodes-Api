import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ICustomerResolver } from '../../core/ports/customer-resolver.port.js';
import { createLogger } from '../../shared/logger.js';
import { getStripeClient } from './stripe-client.js';

const logger = createLogger('stripe-customer-resolver');

@injectable()
export class StripeCustomerResolverAdapter implements ICustomerResolver {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async getCachedCustomerId(userId: string): Promise<string | null> {
    const row = await this.db.queryOne<{ stripe_customer_id: string | null }>(
      'profiles',
      { eq: [['user_id', userId]], select: 'stripe_customer_id' },
    );
    const cid = row?.stripe_customer_id;
    return typeof cid === 'string' && cid.length > 0 ? cid : null;
  }

  async lookupCustomer(email: string): Promise<string | null> {
    const stripe = getStripeClient();
    const customers = await stripe.customers.list({ email, limit: 1 });
    return customers.data.length > 0 ? customers.data[0].id : null;
  }

  async createCustomer(params: {
    email: string;
    name?: string | null;
    metadata?: Record<string, string>;
  }): Promise<string> {
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name ?? undefined,
      metadata: params.metadata ?? {},
    });
    logger.info('Stripe customer created', { customerId: customer.id });
    return customer.id;
  }

  async cacheCustomerId(userId: string, customerId: string): Promise<void> {
    try {
      await this.db.update(
        'profiles',
        { user_id: userId },
        { stripe_customer_id: customerId },
      );
    } catch (err) {
      logger.warn('Failed to cache stripe_customer_id on profile (non-blocking)', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
