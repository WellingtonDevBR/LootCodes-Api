import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { ICardChallengeRepository } from '../../ports/card-challenge-repository.port.js';
import type { ChooseIdResult } from './card-challenge.types.js';
import { ValidationError, NotFoundError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('choose-id-use-case');

@injectable()
export class ChooseIdUseCase {
  constructor(
    @inject(TOKENS.CardChallengeRepository) private repo: ICardChallengeRepository,
  ) {}

  async execute(challengeId: string): Promise<ChooseIdResult> {
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
