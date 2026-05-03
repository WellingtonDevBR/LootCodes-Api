import { injectable } from 'tsyringe';
import type {
  IPaymentProviderFactory,
  IPaymentCapturerFactory,
  IPaymentVerifierFactory,
  PaymentProviderName,
} from '../../core/ports/payment-provider-factory.port.js';
import type { IPaymentProvider } from '../../core/ports/payment-provider.port.js';
import type { IPaymentCapturer } from '../../core/ports/payment-capturer.port.js';
import type { IPaymentVerifier } from '../../core/ports/payment-verifier.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';
import { StripePaymentAdapter } from './stripe-payment.adapter.js';
import { StripePaymentCapturerAdapter } from './stripe-payment-capturer.adapter.js';
import { StripePaymentVerifierAdapter } from './stripe-payment-verifier.adapter.js';
import { isPayPalConfigured } from './paypal-client.js';
import { PayPalPaymentAdapter } from './paypal-payment.adapter.js';
import { PayPalPaymentCapturerAdapter } from './paypal-payment-capturer.adapter.js';
import { PayPalPaymentVerifierAdapter } from './paypal-payment-verifier.adapter.js';

@injectable()
export class PaymentProviderFactoryAdapter implements IPaymentProviderFactory {
  private readonly providers = new Map<PaymentProviderName, IPaymentProvider>();

  getProvider(name: PaymentProviderName): IPaymentProvider {
    let provider = this.providers.get(name);
    if (provider) return provider;

    switch (name) {
      case 'stripe':
        provider = new StripePaymentAdapter();
        break;
      case 'paypal':
        if (!isPayPalConfigured()) {
          throw new InternalError('PayPal is not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
        }
        provider = new PayPalPaymentAdapter();
        break;
      default:
        throw new InternalError(`Unknown payment provider: ${name}`);
    }
    this.providers.set(name, provider);
    return provider;
  }

  isProviderAvailable(name: PaymentProviderName): boolean {
    if (name === 'stripe') return true;
    if (name === 'paypal') return isPayPalConfigured();
    return false;
  }
}

@injectable()
export class PaymentCapturerFactoryAdapter implements IPaymentCapturerFactory {
  private readonly capturers = new Map<PaymentProviderName, IPaymentCapturer>();

  getCapturer(name: PaymentProviderName): IPaymentCapturer {
    let capturer = this.capturers.get(name);
    if (capturer) return capturer;

    switch (name) {
      case 'stripe':
        capturer = new StripePaymentCapturerAdapter();
        break;
      case 'paypal':
        capturer = new PayPalPaymentCapturerAdapter();
        break;
      default:
        throw new InternalError(`Unknown payment capturer: ${name}`);
    }
    this.capturers.set(name, capturer);
    return capturer;
  }
}

@injectable()
export class PaymentVerifierFactoryAdapter implements IPaymentVerifierFactory {
  private readonly verifiers = new Map<PaymentProviderName, IPaymentVerifier>();

  getVerifier(name: PaymentProviderName): IPaymentVerifier {
    let verifier = this.verifiers.get(name);
    if (verifier) return verifier;

    switch (name) {
      case 'stripe': {
        const stripeProvider = new StripePaymentAdapter();
        verifier = new StripePaymentVerifierAdapter(stripeProvider);
        break;
      }
      case 'paypal':
        verifier = new PayPalPaymentVerifierAdapter();
        break;
      default:
        throw new InternalError(`Unknown payment verifier: ${name}`);
    }
    this.verifiers.set(name, verifier);
    return verifier;
  }
}
