import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { ICardChallengeService } from '../../core/ports/card-challenge-service.port.js';
import type { StartChallengeDto, VerifyChallengeDto } from '../../core/services/card-challenge/card-challenge.types.js';
import {
  startChallengeBodySchema,
  verifyChallengeBodySchema,
  chooseIdBodySchema,
} from '../schemas/card-challenge.schema.js';

export async function cardChallengeRoutes(app: FastifyInstance) {
  app.post<{ Body: StartChallengeDto }>(
    '/start',
    {
      schema: { body: startChallengeBodySchema },
    },
    async (request, reply) => {
      const challengeService = container.resolve<ICardChallengeService>(TOKENS.CardChallengeService);
      const result = await challengeService.startChallenge(request.body);
      return reply.code(201).send(result);
    },
  );

  app.post<{ Body: { challenge_id: string; amount_cents: number } }>(
    '/verify',
    {
      schema: { body: verifyChallengeBodySchema },
    },
    async (request, reply) => {
      const challengeService = container.resolve<ICardChallengeService>(TOKENS.CardChallengeService);
      const dto: VerifyChallengeDto = { amount_cents: request.body.amount_cents };
      const result = await challengeService.verify(request.body.challenge_id, dto);
      return reply.send(result);
    },
  );

  app.post<{ Body: { challenge_id: string } }>(
    '/choose-id',
    {
      schema: { body: chooseIdBodySchema },
    },
    async (request, reply) => {
      const challengeService = container.resolve<ICardChallengeService>(TOKENS.CardChallengeService);
      const result = await challengeService.chooseId(request.body.challenge_id);
      return reply.send(result);
    },
  );
}
