import { injectable } from 'tsyringe';
import type { IMicroAuthProvider, MicroAuthResult } from '../../core/ports/micro-auth-provider.port.js';
import { InternalError } from '../../core/errors/domain-errors.js';

@injectable()
export class StubMicroAuthAdapter implements IMicroAuthProvider {
  async createMicroAuth(
    _paymentMethodId: string,
    _customerId?: string,
  ): Promise<MicroAuthResult> {
    throw new InternalError('Micro-auth provider not configured');
  }

  async verifyAmount(
    _authorizationId: string,
    _submittedAmount: number,
  ): Promise<boolean> {
    throw new InternalError('Micro-auth provider not configured');
  }

  async cancelAuth(_authorizationId: string): Promise<void> {
    throw new InternalError('Micro-auth provider not configured');
  }
}
