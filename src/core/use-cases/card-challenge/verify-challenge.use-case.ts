import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICardChallengeRepository } from '../../ports/card-challenge-repository.port.js';
import type { VerifyChallengeDto, VerifyChallengeResult } from './card-challenge.types.js';
import { ValidationError, NotFoundError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('verify-challenge-use-case');

@injectable()
export class VerifyChallengeUseCase {
  constructor(
    @inject(TOKENS.CardChallengeRepository) private repo: ICardChallengeRepository,
  ) {}

  async execute(challengeId: string, dto: VerifyChallengeDto): Promise<VerifyChallengeResult> {
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
}
