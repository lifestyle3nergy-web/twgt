import { FastifyInstance } from 'fastify';
import { AuthService } from '@auth/auth.service';
import { AuthHandler } from '../handlers/auth.handler';
import { authGuard } from '@auth/auth.guard';
import { env } from '@config';

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(env.JWT_SECRET, env.REFRESH_SECRET);
  const handler = new AuthHandler(authService);

  app.post('/auth/register', (req, reply) => handler.register(req, reply));
  app.post('/auth/login', (req, reply) => handler.login(req, reply));
  app.get<any>('/auth/me', { preHandler: authGuard }, (req, reply) => handler.me(req, reply));
}
