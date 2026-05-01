import crypto from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { extractClientIP } from '../../shared/client-ip.js';

export type ClientChannel = 'web' | 'mobile_app' | 'unknown';

export interface RequestContext {
  requestId: string;
  clientIP: string;
  sessionId?: string;
  userAgent?: string;
  channel: ClientChannel;
}

function deriveChannel(requestedBy: string | undefined): ClientChannel {
  if (requestedBy === 'lootcodes-web') return 'web';
  if (requestedBy === 'lootcodes-app') return 'mobile_app';
  return 'unknown';
}

export function buildRequestContext(request: FastifyRequest, body?: Record<string, unknown>): RequestContext {
  const headers = request.headers as Record<string, string | string[] | undefined>;
  return {
    requestId: crypto.randomUUID(),
    clientIP: extractClientIP(headers),
    sessionId: typeof body?.session_id === 'string' ? body.session_id : undefined,
    userAgent: request.headers['user-agent'] ?? undefined,
    channel: deriveChannel(request.headers['x-requested-by'] as string | undefined),
  };
}
