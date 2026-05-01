import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetHoldUseCase } from '../../core/use-cases/security/get-hold.use-case.js';
import type { GetHoldStatusUseCase } from '../../core/use-cases/security/get-hold-status.use-case.js';
import type { UploadDocumentUseCase } from '../../core/use-cases/security/upload-document.use-case.js';
import type { SubmitResponseUseCase } from '../../core/use-cases/security/submit-response.use-case.js';
import type { UnlockAccountUseCase } from '../../core/use-cases/security/unlock-account.use-case.js';
import type { SubmitHoldResponseDto } from '../../core/use-cases/security/security.types.js';
import {
  holdIdParamsSchema,
  submitResponseBodySchema,
  unlockAccountBodySchema,
} from '../schemas/security.schema.js';

export async function securityRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/holds/:id',
    { schema: { params: holdIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetHoldUseCase>(UC_TOKENS.GetHold);
      const hold = await uc.execute(request.params.id);
      return reply.send(hold);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/holds/:id/status',
    { schema: { params: holdIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetHoldStatusUseCase>(UC_TOKENS.GetHoldStatus);
      const status = await uc.execute(request.params.id);
      return reply.send({ status });
    },
  );

  app.post<{ Params: { id: string } }>(
    '/holds/:id/upload',
    { schema: { params: holdIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<UploadDocumentUseCase>(UC_TOKENS.UploadDocument);

      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
      ];
      if (!allowedMimes.includes(data.mimetype)) {
        return reply.code(400).send({ error: 'Invalid file type' });
      }

      const fileBuffer = await data.toBuffer();
      const storagePath = `holds/${request.params.id}/${data.filename}`;
      const url = await uc.execute(
        request.params.id,
        storagePath,
        fileBuffer,
        data.mimetype,
      );
      return reply.send({ url });
    },
  );

  app.post<{
    Params: { id: string };
    Body: { responses: Record<string, unknown>; evidence_urls: string[]; email: string };
  }>(
    '/holds/:id/respond',
    { schema: { params: holdIdParamsSchema, body: submitResponseBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<SubmitResponseUseCase>(UC_TOKENS.SubmitHoldResponse);
      const dto: SubmitHoldResponseDto = {
        responses: request.body.responses,
        evidence_urls: request.body.evidence_urls,
      };
      await uc.execute(request.params.id, dto, request.body.email);
      return reply.send({ success: true });
    },
  );

  app.post<{ Body: { token: string } }>(
    '/unlock-account',
    { schema: { body: unlockAccountBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<UnlockAccountUseCase>(UC_TOKENS.UnlockAccount);
      const result = await uc.execute(request.body.token);
      return reply.send(result);
    },
  );
}
