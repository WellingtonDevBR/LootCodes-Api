import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IProductKeyRepository } from '../../ports/product-key-repository.port.js';

interface LogAccessAttemptDto {
  token?: string;
  order_id?: string;
  email?: string;
  success: boolean;
  failure_reason?: string;
}

@injectable()
export class LogAccessAttemptUseCase {
  constructor(
    @inject(TOKENS.ProductKeyRepository) private productKeyRepo: IProductKeyRepository,
  ) {}

  async execute(dto: LogAccessAttemptDto): Promise<void> {
    await this.productKeyRepo.logAccessAttempt({
      token: dto.token,
      order_id: dto.order_id,
      email: dto.email,
      success: dto.success,
      failure_reason: dto.failure_reason,
    });
  }
}
