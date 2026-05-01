import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { ISecurityService } from '../../core/ports/security-service.port.js';
import type { SubmitHoldResponseDto } from '../../core/services/security/security.types.js';
import {
  holdIdParamsSchema,
  uploadDocumentBodySchema,
  submitResponseBodySchema,
} from '../schemas/security.schema.js';

export async function securityRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/holds/:id',
    {
      schema: { params: holdIdParamsSchema },
    },
    async (request, reply) => {
      const securityService = container.resolve<ISecurityService>(TOKENS.SecurityService);
      const hold = await securityService.getHold(request.params.id);
      return reply.send(hold);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/holds/:id/status',
    {
      schema: { params: holdIdParamsSchema },
    },
    async (request, reply) => {
      const securityService = container.resolve<ISecurityService>(TOKENS.SecurityService);
      const status = await securityService.getHoldStatus(request.params.id);
      return reply.send({ status });
    },
  );

  app.post<{ Params: { id: string }; Body: { path: string; content_type: string } }>(
    '/holds/:id/upload',
    {
      schema: { params: holdIdParamsSchema, body: uploadDocumentBodySchema },
    },
    async (request, reply) => {
      const securityService = container.resolve<ISecurityService>(TOKENS.SecurityService);
      const url = await securityService.uploadDocument(
        request.params.id,
        request.body.path,
        Buffer.alloc(0),
        request.body.content_type,
      );
      return reply.send({ url });
    },
  );

  app.post<{
    Params: { id: string };
    Body: { responses: Record<string, unknown>; evidence_urls: string[]; email: string };
  }>(
    '/holds/:id/respond',
    {
      schema: { params: holdIdParamsSchema, body: submitResponseBodySchema },
    },
    async (request, reply) => {
      const securityService = container.resolve<ISecurityService>(TOKENS.SecurityService);
      const dto: SubmitHoldResponseDto = {
        responses: request.body.responses,
        evidence_urls: request.body.evidence_urls,
      };
      await securityService.submitResponse(request.params.id, dto, request.body.email);
      return reply.send({ success: true });
    },
  );
}
