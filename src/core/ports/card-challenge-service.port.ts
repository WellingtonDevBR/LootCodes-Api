import type {
  StartChallengeDto,
  StartChallengeResult,
  VerifyChallengeDto,
  VerifyChallengeResult,
  ChooseIdResult,
} from '../services/card-challenge/card-challenge.types.js';

export interface ICardChallengeService {
  startChallenge(dto: StartChallengeDto): Promise<StartChallengeResult>;
  verify(challengeId: string, dto: VerifyChallengeDto): Promise<VerifyChallengeResult>;
  chooseId(challengeId: string): Promise<ChooseIdResult>;
}
