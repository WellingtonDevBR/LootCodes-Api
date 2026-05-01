import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { StartChallengeUseCase } from '../../core/use-cases/card-challenge/start-challenge.use-case.js';
import type { VerifyChallengeUseCase } from '../../core/use-cases/card-challenge/verify-challenge.use-case.js';
import type { ChooseIdUseCase } from '../../core/use-cases/card-challenge/choose-id.use-case.js';
import type { StartChallengeDto, VerifyChallengeDto } from '../../core/use-cases/card-challenge/card-challenge.types.js';
import {
  startChallengeBodySchema,
  verifyChallengeBodySchema,
  chooseIdBodySchema,
} from '../schemas/card-challenge.schema.js';

export async function cardChallengeRoutes(app: FastifyInstance) {
  app.post<{ Body: StartChallengeDto }>(
    '/start',
    { schema: { body: startChallengeBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<StartChallengeUseCase>(UC_TOKENS.StartChallenge);
      const result = await uc.execute(request.body);
      return reply.code(201).send(result);
    },
  );

  app.post<{ Body: { challenge_id: string; amount_cents: number } }>(
    '/verify',
    { schema: { body: verifyChallengeBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<VerifyChallengeUseCase>(UC_TOKENS.VerifyChallenge);
      const dto: VerifyChallengeDto = { amount_cents: request.body.amount_cents };
      const result = await uc.execute(request.body.challenge_id, dto);
      return reply.send(result);
    },
  );

  app.post<{ Body: { challenge_id: string } }>(
    '/choose-id',
    { schema: { body: chooseIdBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<ChooseIdUseCase>(UC_TOKENS.ChooseId);
      const result = await uc.execute(request.body.challenge_id);
      return reply.send(result);
    },
  );
}
