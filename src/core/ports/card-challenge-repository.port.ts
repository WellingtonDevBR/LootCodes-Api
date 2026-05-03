import type {
  CardChallenge,
  StartChallengeDto,
  VerifyChallengeDto,
  VerifyChallengeResult,
  ChooseIdResult,
} from '../use-cases/card-challenge/card-challenge.types.js';

export interface ICardChallengeRepository {
  findById(challengeId: string): Promise<CardChallenge | null>;
  findByOrderId(orderId: string): Promise<CardChallenge | null>;
  create(dto: StartChallengeDto): Promise<CardChallenge>;
  verify(challengeId: string, dto: VerifyChallengeDto): Promise<VerifyChallengeResult>;
  chooseId(challengeId: string): Promise<ChooseIdResult>;
  /**
   * True when `card_verifications` has a succeeded row for the order —
   * same source-of-truth as Edge `payment-verification` (`hasSucceededCardChallenge`).
   */
  hasSucceededOrderCardVerification(orderId: string): Promise<boolean>;
}
