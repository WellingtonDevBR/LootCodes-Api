import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetTicketUseCase } from '../../core/use-cases/support/get-ticket.use-case.js';
import type { GetUserTicketsUseCase } from '../../core/use-cases/support/get-user-tickets.use-case.js';
import type { AddMessageUseCase } from '../../core/use-cases/support/add-message.use-case.js';
import type { UpdateStatusUseCase } from '../../core/use-cases/support/update-status.use-case.js';
import type { SubmitFeedbackUseCase } from '../../core/use-cases/support/submit-feedback.use-case.js';
import type { GetVerificationTicketsUseCase } from '../../core/use-cases/support/get-verification-tickets.use-case.js';
import type { UploadAttachmentUseCase } from '../../core/use-cases/support/upload-attachment.use-case.js';
import type { CreateTicketUseCase } from '../../core/use-cases/support/create-ticket.use-case.js';
import type { CreateTicketDto, AddMessageDto, TicketFeedbackDto } from '../../core/use-cases/support/support.types.js';
import type { IAttachmentStorage } from '../../core/ports/attachment-storage.port.js';
import { TOKENS } from '../../di/tokens.js';
import { authGuard } from '../middleware/auth.guard.js';
import { ValidationError } from '../../core/errors/domain-errors.js';
import {
  createTicketBodySchema,
  ticketNumberParamsSchema,
  ticketDetailQuerySchema,
  addMessageBodySchema,
  updateStatusBodySchema,
  reopenTicketBodySchema,
  submitFeedbackBodySchema,
  orderIdParamsSchema,
} from '../schemas/support.schema.js';

interface AuthUser {
  id: string;
  email?: string;
}

function getAuthUser(request: unknown): AuthUser {
  return (request as Record<string, unknown>).authUser as AuthUser;
}

function tryGetAuthUser(request: unknown): AuthUser | undefined {
  return (request as Record<string, unknown>).authUser as AuthUser | undefined;
}

async function optionalAuthGuard(request: unknown, reply: unknown) {
  try {
    await authGuard(
      request as Parameters<typeof authGuard>[0],
      reply as Parameters<typeof authGuard>[1],
    );
  } catch {
    // Auth is optional — continue without user
  }
}

export async function supportRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateTicketDto }>(
    '/',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: createTicketBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<CreateTicketUseCase>(UC_TOKENS.CreateTicket);
      const user = tryGetAuthUser(request);

      const ticket = await uc.execute(request.body, user?.id);
      return reply.code(201).send(ticket);
    },
  );

  app.get<{ Params: { ticketNumber: string }; Querystring: { email?: string } }>(
    '/:ticketNumber',
    {
      preHandler: [optionalAuthGuard],
      schema: { params: ticketNumberParamsSchema, querystring: ticketDetailQuerySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetTicketUseCase>(UC_TOKENS.GetTicket);
      const user = tryGetAuthUser(request);

      const result = await uc.execute(request.params.ticketNumber, {
        userId: user?.id,
        userEmail: user?.email,
        email: request.query.email,
      });
      return reply.send(result);
    },
  );

  app.get<{ Querystring: { include?: string } }>(
    '/',
    {
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const uc = container.resolve<GetUserTicketsUseCase>(UC_TOKENS.GetUserTickets);
      const user = getAuthUser(request);
      const includeMessages = request.query.include === 'messages';

      if (includeMessages) {
        const tickets = await uc.executeWithMessages(user.id);
        return reply.send({ tickets });
      }

      const tickets = await uc.execute(user.id);
      return reply.send({ tickets });
    },
  );

  app.post<{ Body: AddMessageDto }>(
    '/messages',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: addMessageBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<AddMessageUseCase>(UC_TOKENS.AddMessage);
      const user = tryGetAuthUser(request);

      await uc.execute(request.body as AddMessageDto & Record<string, unknown>, user?.id);
      return reply.send({ success: true });
    },
  );

  app.put<{ Params: { ticketNumber: string }; Body: { status: string; reason?: string } }>(
    '/:ticketNumber/status',
    {
      preHandler: [authGuard],
      schema: { params: ticketNumberParamsSchema, body: updateStatusBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<UpdateStatusUseCase>(UC_TOKENS.UpdateTicketStatus);
      const user = getAuthUser(request);

      await uc.execute(
        request.params.ticketNumber,
        request.body.status,
        user.id,
        request.body.reason,
      );
      return reply.send({ success: true });
    },
  );

  app.put<{ Params: { ticketNumber: string }; Body: { reason?: string } }>(
    '/:ticketNumber/reopen',
    {
      preHandler: [authGuard],
      schema: { params: ticketNumberParamsSchema, body: reopenTicketBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<UpdateStatusUseCase>(UC_TOKENS.UpdateTicketStatus);
      const user = getAuthUser(request);

      await uc.execute(
        request.params.ticketNumber,
        'open',
        user.id,
        request.body.reason,
      );
      return reply.send({ success: true });
    },
  );

  app.post<{ Body: TicketFeedbackDto }>(
    '/feedback',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: submitFeedbackBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<SubmitFeedbackUseCase>(UC_TOKENS.SubmitFeedback);
      const user = tryGetAuthUser(request);

      await uc.execute(request.body, user?.id);
      return reply.send({ success: true });
    },
  );

  app.get<{ Params: { orderId: string } }>(
    '/orders/:orderId/verification',
    {
      preHandler: [authGuard],
      schema: { params: orderIdParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<GetVerificationTicketsUseCase>(UC_TOKENS.GetVerificationTickets);
      const user = getAuthUser(request);

      const tickets = await uc.execute(request.params.orderId, user.id);
      return reply.send({ tickets });
    },
  );

  app.post<{ Params: { ticketNumber: string } }>(
    '/:ticketNumber/attachments',
    {
      preHandler: [authGuard],
      schema: { params: ticketNumberParamsSchema },
    },
    async (request, reply) => {
      const uc = container.resolve<UploadAttachmentUseCase>(UC_TOKENS.UploadAttachment);
      const user = getAuthUser(request);

      const data = await request.file();
      if (!data) {
        throw new ValidationError('No file uploaded');
      }

      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain',
      ];
      if (!allowedMimes.includes(data.mimetype)) {
        throw new ValidationError('Invalid file type');
      }

      const fileBuffer = await data.toBuffer();
      const url = await uc.execute(
        request.params.ticketNumber,
        user.id,
        fileBuffer,
        data.filename,
        data.mimetype,
      );
      return reply.send({ url });
    },
  );

  app.post(
    '/pre-upload',
    {
      preHandler: [optionalAuthGuard],
    },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        throw new ValidationError('No file uploaded');
      }

      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain',
      ];
      if (!allowedMimes.includes(data.mimetype)) {
        throw new ValidationError('Invalid file type');
      }

      const fileBuffer = await data.toBuffer();
      const storage = container.resolve<IAttachmentStorage>(TOKENS.AttachmentStorage);
      const filePath = await storage.uploadPreTicket(fileBuffer, data.filename, data.mimetype);
      return reply.send({ path: filePath });
    },
  );
}
