import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';

export async function registerRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await authRoutes(app);
}
