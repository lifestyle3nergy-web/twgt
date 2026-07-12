import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@database';
import redis from '@database/redis';
import { logger } from '@config';

export async function healthHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis
    await redis.ping();

    const health = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        cache: 'ok',
      },
    };

    reply.status(200).send(health);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    reply.status(503).send({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function readyHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.status(200).send({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
}
