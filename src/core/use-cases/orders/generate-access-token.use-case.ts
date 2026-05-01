import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';
import type { OrderAccessToken } from './order.types.js';

@injectable()
export class GenerateAccessTokenUseCase {
  constructor(
    @inject(TOKENS.OrderAccessTokenRepository) private tokenRepo: IOrderAccessTokenRepository,
  ) {}

  async execute(orderId: string, email: string): Promise<OrderAccessToken> {
    return this.tokenRepo.generate(orderId, email);
  }
}
