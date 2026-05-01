import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderAccessTokenRepository } from '../../ports/order-access-token-repository.port.js';

@injectable()
export class ValidateAccessTokenUseCase {
  constructor(
    @inject(TOKENS.OrderAccessTokenRepository) private tokenRepo: IOrderAccessTokenRepository,
  ) {}

  async execute(token: string, orderId: string): Promise<boolean> {
    const accessToken = await this.tokenRepo.validate(token, orderId);
    return accessToken !== null;
  }
}
