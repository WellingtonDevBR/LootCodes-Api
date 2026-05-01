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
}
