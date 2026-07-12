import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { env, logger } from '@config';
import { registerRoutes } from '@api/routes';

export async function bootstrap() {
  const app = Fastify({
    logger: logger,
  });

  // Register plugins
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
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
