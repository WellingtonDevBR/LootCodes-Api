import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { ISupportService } from '../../core/ports/support-service.port.js';
import type { CreateTicketDto, AddMessageDto, TicketFeedbackDto } from '../../core/services/support/support.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  createTicketBodySchema,
  ticketNumberParamsSchema,
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
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = tryGetAuthUser(request);

      const ticket = await supportService.createTicket(request.body, user?.id);
      return reply.code(201).send(ticket);
    },
  );

  app.get<{ Params: { ticketNumber: string } }>(
    '/:ticketNumber',
    {
      preHandler: [optionalAuthGuard],
      schema: { params: ticketNumberParamsSchema },
    },
    async (request, reply) => {
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = tryGetAuthUser(request);

      const detail = await supportService.getTicket(request.params.ticketNumber, user?.id);
      return reply.send(detail);
    },
  );

  app.get(
    '/',
    {
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = getAuthUser(request);

      const tickets = await supportService.getUserTickets(user.id);
      return reply.send({ tickets });
    },
  );

  app.post<{ Body: AddMessageDto }>(
    '/messages',
    {
      preHandler: [authGuard],
      schema: { body: addMessageBodySchema },
    },
    async (request, reply) => {
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = getAuthUser(request);

      await supportService.addMessage(request.body, user.id);
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
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = getAuthUser(request);

      await supportService.updateStatus(
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
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = getAuthUser(request);

      await supportService.reopenTicket(
        request.params.ticketNumber,
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
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = tryGetAuthUser(request);

      await supportService.submitFeedback(request.body, user?.id);
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
      const supportService = container.resolve<ISupportService>(TOKENS.SupportService);
      const user = getAuthUser(request);

      const tickets = await supportService.getVerificationTicketsForOrder(
        request.params.orderId,
        user.id,
      );
      return reply.send({ tickets });
    },
  );
}
