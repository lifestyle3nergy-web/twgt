import Fastify, { type FastifyBaseLogger } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { env, logger } from '@config';
import { registerRoutes } from '@api/routes/index';

export async function bootstrap() {
  const app = Fastify({
    loggerInstance: logger as unknown as FastifyBaseLogger,
  });

  // Register plugins
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  const wildcardOrigin = env.CORS_ORIGIN === '*';
  await app.register(fastifyCors, {
    origin: wildcardOrigin ? '*' : env.CORS_ORIGIN.split(','),
    credentials: wildcardOrigin ? false : env.CORS_CREDENTIALS,
  });

  // Register routes
  await registerRoutes(app);

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    logger.error({ error, url: request.url }, 'Request error');
    reply.status(500).send({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
