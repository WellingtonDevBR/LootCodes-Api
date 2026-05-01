import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICardChallengeRepository } from '../../ports/card-challenge-repository.port.js';
import type { IMicroAuthProvider } from '../../ports/micro-auth-provider.port.js';
import type { StartChallengeDto, StartChallengeResult } from './card-challenge.types.js';
import { ValidationError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('start-challenge-use-case');

@injectable()
export class StartChallengeUseCase {
  constructor(
    @inject(TOKENS.CardChallengeRepository) private repo: ICardChallengeRepository,
    @inject(TOKENS.MicroAuthProvider) private microAuth: IMicroAuthProvider,
  ) {}

  async execute(dto: StartChallengeDto): Promise<StartChallengeResult> {
    if (!dto.order_id) {
      throw new ValidationError('order_id is required');
    }
    if (!dto.payment_method_id) {
      throw new ValidationError('payment_method_id is required');
    }

    await this.microAuth.createMicroAuth(dto.payment_method_id, dto.customer_id);

    const challenge = await this.repo.create(dto);

    logger.info('Card challenge started', {
      challengeId: challenge.id,
      orderId: dto.order_id,
    });

    return {
      challenge_id: challenge.id,
      status: challenge.status,
    };
  }
}
