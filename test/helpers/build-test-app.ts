import 'reflect-metadata';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';

export async function buildTestApp(
  registerRoutes: (app: FastifyInstance) => Promise<void>,
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await registerRoutes(app);
  await app.ready();

  return app;
}
