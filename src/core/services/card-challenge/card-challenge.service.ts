import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICardChallengeRepository } from '../../ports/card-challenge-repository.port.js';
import type { IMicroAuthProvider } from '../../ports/micro-auth-provider.port.js';
import type { ICardChallengeService } from '../../ports/card-challenge-service.port.js';
import type {
  StartChallengeDto,
  StartChallengeResult,
  VerifyChallengeDto,
  VerifyChallengeResult,
  ChooseIdResult,
} from './card-challenge.types.js';
import { ValidationError, NotFoundError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('card-challenge-service');

@injectable()
export class CardChallengeService implements ICardChallengeService {
  constructor(
    @inject(TOKENS.CardChallengeRepository) private repo: ICardChallengeRepository,
    @inject(TOKENS.MicroAuthProvider) private microAuth: IMicroAuthProvider,
  ) {}

  async startChallenge(dto: StartChallengeDto): Promise<StartChallengeResult> {
    if (!dto.order_id) {
      throw new ValidationError('order_id is required');
    }
    if (!dto.payment_method_id) {
      throw new ValidationError('payment_method_id is required');
    }

    await this.microAuth.createMicroAuth(
      dto.payment_method_id,
      dto.customer_id,
    );

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

  async verify(challengeId: string, dto: VerifyChallengeDto): Promise<VerifyChallengeResult> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Card challenge not found');
    }

    if (challenge.status === 'expired') {
      throw new ValidationError('Challenge has expired');
    }
    if (challenge.status === 'failed') {
      throw new ValidationError('Challenge has failed — maximum attempts exceeded');
    }
    if (challenge.status === 'verified') {
      throw new ValidationError('Challenge is already verified');
    }
    if (challenge.attempts >= challenge.max_attempts) {
      throw new ValidationError('Maximum attempts exceeded');
    }

    const result = await this.repo.verify(challenge.id, dto);

    logger.info('Card challenge verification attempt', {
      challengeId: challenge.id,
      verified: result.verified,
      attemptsRemaining: result.attempts_remaining,
    });

    return result;
  }

  async chooseId(challengeId: string): Promise<ChooseIdResult> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Card challenge not found');
    }

    if (challenge.status !== 'pending') {
      throw new ValidationError('Challenge must be in pending status to choose ID verification');
    }

    const result = await this.repo.chooseId(challenge.id);

    logger.info('Card challenge — ID verification chosen', {
      challengeId: challenge.id,
    });

    return result;
  }
}
