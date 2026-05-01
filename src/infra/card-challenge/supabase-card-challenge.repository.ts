import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { ICardChallengeRepository } from '../../core/ports/card-challenge-repository.port.js';
import type {
  CardChallenge,
  StartChallengeDto,
  VerifyChallengeDto,
  VerifyChallengeResult,
  ChooseIdResult,
} from '../../core/use-cases/card-challenge/card-challenge.types.js';

@injectable()
export class SupabaseCardChallengeRepository implements ICardChallengeRepository {
  constructor(@inject(TOKENS.Database) private db: IDatabase) {}

  async findById(challengeId: string): Promise<CardChallenge | null> {
    return this.db.queryOne<CardChallenge>('card_challenges', {
      eq: [['id', challengeId]],
    });
  }

  async findByOrderId(orderId: string): Promise<CardChallenge | null> {
    return this.db.queryOne<CardChallenge>('card_challenges', {
      eq: [['order_id', orderId]],
    });
  }

  async create(dto: StartChallengeDto): Promise<CardChallenge> {
    return this.db.insert<CardChallenge>('card_challenges', {
      order_id: dto.order_id,
      payment_method_id: dto.payment_method_id,
      customer_id: dto.customer_id ?? null,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
    });
  }

  async verify(challengeId: string, dto: VerifyChallengeDto): Promise<VerifyChallengeResult> {
    const result = await this.db.rpc<VerifyChallengeResult>('verify_card_challenge', {
      p_challenge_id: challengeId,
      p_amount_cents: dto.amount_cents,
    });
    return result ?? { verified: false, attempts_remaining: 0 };
  }

  async chooseId(challengeId: string): Promise<ChooseIdResult> {
    await this.db.update('card_challenges', { id: challengeId }, {
      status: 'id_chosen',
    });
    return { ok: true };
  }
}
