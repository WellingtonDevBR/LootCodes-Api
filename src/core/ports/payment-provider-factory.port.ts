import type { IPaymentProvider } from './payment-provider.port.js';
import type { IPaymentCapturer } from './payment-capturer.port.js';
import type { IPaymentVerifier } from './payment-verifier.port.js';

export type PaymentProviderName = 'stripe' | 'paypal';

export interface IPaymentProviderFactory {
  getProvider(name: PaymentProviderName): IPaymentProvider;
  isProviderAvailable(name: PaymentProviderName): boolean;
}

export interface IPaymentCapturerFactory {
  getCapturer(name: PaymentProviderName): IPaymentCapturer;
}

export interface IPaymentVerifierFactory {
  getVerifier(name: PaymentProviderName): IPaymentVerifier;
}
