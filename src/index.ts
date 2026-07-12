import { bootstrap } from '@core/bootstrap';
import { env, logger } from '@config';
import { prisma } from '@database';

async function main() {
  try {
    logger.info('🚀 Starting TWGT Platform');

    // Connect to database
    logger.info('📦 Connecting to database...');
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Bootstrap the application
    const app = await bootstrap();

    // Start the server
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`✅ Server listening at http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    logger.error({ error }, '❌ Application startup failed');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
