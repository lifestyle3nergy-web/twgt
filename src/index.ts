import type { FastifyInstance } from 'fastify';
import { bootstrap } from '@core/app.bootstrap';
import { env, logger } from '@config';
import { prisma, redis } from '@database';

let app: FastifyInstance | undefined;

async function main() {
  try {
    logger.info('🚀 Starting TWGT Platform');

    // Connect to database
    logger.info('📦 Connecting to database...');
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Bootstrap the application
    const server = await bootstrap();
    app = server;

    // Start the server
    await server.listen({ port: env.PORT, host: env.HOST });
    logger.info(`✅ Server listening at http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    logger.error({ error }, '❌ Application startup failed');
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`);
  await app?.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
